import Workspace from '../models/Workspace.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = async (req, res, next) => {
  try {
    const { name, description, type, currency } = req.body;

    // Create workspace
    const workspace = await Workspace.create({
      name,
      description,
      type,
      currency,
      owner: req.user._id,
    });

    // Create OWNER membership for the creator
    await Membership.create({
      user: req.user._id,
      workspace: workspace._id,
      role: 'OWNER',
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workspaces the current user is a member of
// @route   GET /api/workspaces
// @access  Private
export const getMyWorkspaces = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ user: req.user._id })
      .populate('workspace')
      .sort({ createdAt: -1 });

    // Filter out archived workspaces (unless includeArchived=true)
    const includeArchived = req.query.includeArchived === 'true';
    const filtered = memberships.filter(
      (m) => m.workspace && (includeArchived || !m.workspace.isArchived)
    );

    const workspaces = filtered.map((m) => ({
      workspace: m.workspace,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workspace with members
// @route   GET /api/workspaces/:workspaceId
// @access  Private (must be member)
export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId).populate(
      'owner',
      'name email avatar'
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    // Get all members
    const members = await Membership.find({ workspace: workspace._id })
      .populate('user', 'name email avatar')
      .sort({ role: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        workspace,
        members,
        myRole: req.membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workspace details
// @route   PUT /api/workspaces/:workspaceId
// @access  Private (ADMIN+)
export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description, type, currency, avatar } = req.body;

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { name, description, type, currency, avatar },
      { new: true, runValidators: true }
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workspace updated',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive/Unarchive workspace
// @route   PATCH /api/workspaces/:workspaceId/archive
// @access  Private (OWNER only)
export const archiveWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    workspace.isArchived = !workspace.isArchived;
    await workspace.save();

    res.status(200).json({
      success: true,
      message: workspace.isArchived ? 'Workspace archived' : 'Workspace restored',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workspace permanently
// @route   DELETE /api/workspaces/:workspaceId
// @access  Private (OWNER only)
export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    // Delete all memberships
    await Membership.deleteMany({ workspace: workspace._id });

    // Delete workspace
    await workspace.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite member to workspace
// @route   POST /api/workspaces/:workspaceId/members
// @access  Private (ADMIN+)
export const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const { workspaceId } = req.params;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email. Ask them to sign up first.',
      });
    }

    // Check if already a member
    const existing = await Membership.findOne({
      user: user._id,
      workspace: workspaceId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this workspace',
      });
    }

    // Create membership
    const membership = await Membership.create({
      user: user._id,
      workspace: workspaceId,
      role,
      invitedBy: req.user._id,
    });

    await membership.populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: `${user.name} added to workspace as ${role}`,
      data: { membership },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role
// @route   PATCH /api/workspaces/:workspaceId/members/:memberId
// @access  Private (ADMIN+)
export const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, MEMBER, or VIEWER',
      });
    }

    const membership = await Membership.findById(memberId);

    if (!membership || membership.workspace.toString() !== req.params.workspaceId) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    // Prevent changing OWNER's role
    if (membership.role === 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change owner role. Transfer ownership instead.',
      });
    }

    membership.role = role;
    await membership.save();

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      data: { membership },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:workspaceId/members/:memberId
// @access  Private (ADMIN+)
export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const membership = await Membership.findById(memberId);

    if (!membership || membership.workspace.toString() !== req.params.workspaceId) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    // Can't remove owner
    if (membership.role === 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove workspace owner',
      });
    }

    await membership.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member removed from workspace',
    });
  } catch (error) {
    next(error);
  }
};