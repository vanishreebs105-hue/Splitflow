import Membership, { ROLE_LEVELS } from '../models/Membership.js';

/**
 * Middleware to check if user is a member of the workspace
 * and has required role level.
 *
 * Usage: requireRole('ADMIN') → user must be ADMIN or OWNER
 * Usage: requireRole('MEMBER') → any role MEMBER and above
 *
 * Expects workspaceId in req.params.workspaceId OR req.body.workspaceId
 */
export const requireWorkspaceRole = (minRole = 'MEMBER') => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required',
        });
      }

      const membership = await Membership.findOne({
        user: req.user._id,
        workspace: workspaceId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this workspace',
        });
      }

      const userLevel = ROLE_LEVELS[membership.role];
      const requiredLevel = ROLE_LEVELS[minRole];

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `This action requires ${minRole} role or higher. Your role: ${membership.role}`,
        });
      }

      // Attach membership to request for use in controllers
      req.membership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};