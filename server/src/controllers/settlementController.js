import Settlement from '../models/Settlement.js';
import Membership from '../models/Membership.js';
import {
  calculateBalances,
  balancesToArray,
  getUserSummary,
} from '../utils/balanceCalculator.js';
import { simplifyDebts, calculateSavings } from '../utils/debtSimlifier.js';

// @desc    Get balances for a workspace
// @route   GET /api/workspaces/:workspaceId/balances
// @access  Private (VIEWER+)
export const getBalances = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const balancesMap = await calculateBalances(workspaceId);
    const balancesArray = balancesToArray(balancesMap);

    // Populate user details
    const populated = await Promise.all(
      balancesArray.map(async (item) => {
        const membership = await Membership.findOne({
          workspace: workspaceId,
          user: item.user,
        }).populate('user', 'name email avatar');

        return {
          user: membership?.user || { _id: item.user },
          balance: item.balance,
          status: item.balance > 0.01 ? 'owed' : item.balance < -0.01 ? 'owes' : 'settled',
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { balances: populated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get simplified settlement suggestions
// @route   GET /api/workspaces/:workspaceId/settlements/suggestions
// @access  Private (VIEWER+)
export const getSettlementSuggestions = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const balancesMap = await calculateBalances(workspaceId);
    const balancesArray = balancesToArray(balancesMap);

    // Run the magic algorithm
    const transactions = simplifyDebts(balancesArray);
    const savings = calculateSavings(balancesArray, transactions);

    // Populate user details
    const populated = await Promise.all(
      transactions.map(async (t) => {
        const [fromMember, toMember] = await Promise.all([
          Membership.findOne({ workspace: workspaceId, user: t.from }).populate(
            'user',
            'name email avatar'
          ),
          Membership.findOne({ workspace: workspaceId, user: t.to }).populate(
            'user',
            'name email avatar'
          ),
        ]);

        return {
          from: fromMember?.user || { _id: t.from },
          to: toMember?.user || { _id: t.to },
          amount: t.amount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        suggestions: populated,
        savings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a settlement (payment made)
// @route   POST /api/workspaces/:workspaceId/settlements
// @access  Private (MEMBER+)
export const createSettlement = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { from, to, amount, note, settledAt } = req.body;

    if (from === to) {
      return res.status(400).json({
        success: false,
        message: 'Cannot settle with yourself',
      });
    }

    // Verify both users are workspace members
    const memberships = await Membership.find({
      workspace: workspaceId,
      user: { $in: [from, to] },
    });

    if (memberships.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Both users must be members of this workspace',
      });
    }

    const settlement = await Settlement.create({
      workspace: workspaceId,
      from,
      to,
      amount,
      note,
      settledAt: settledAt || new Date(),
      recordedBy: req.user._id,
    });

    await settlement.populate([
      { path: 'from', select: 'name email avatar' },
      { path: 'to', select: 'name email avatar' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: { settlement },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlement history
// @route   GET /api/workspaces/:workspaceId/settlements
// @access  Private (VIEWER+)
export const getSettlements = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [settlements, total] = await Promise.all([
      Settlement.find({ workspace: workspaceId })
        .populate('from', 'name email avatar')
        .populate('to', 'name email avatar')
        .sort({ settledAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Settlement.countDocuments({ workspace: workspaceId }),
    ]);

    res.status(200).json({
      success: true,
      count: settlements.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { settlements },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a settlement
// @route   DELETE /api/workspaces/:workspaceId/settlements/:settlementId
// @access  Private (MEMBER+)
export const deleteSettlement = async (req, res, next) => {
  try {
    const { workspaceId, settlementId } = req.params;

    const settlement = await Settlement.findOne({
      _id: settlementId,
      workspace: workspaceId,
    });

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found',
      });
    }

    // Only the person who recorded it or an admin can delete
    const isRecorder = settlement.recordedBy.toString() === req.user._id.toString();
    const isAdminOrOwner = ['ADMIN', 'OWNER'].includes(req.membership.role);

    if (!isRecorder && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the recorder or an admin can delete this settlement',
      });
    }

    await settlement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Settlement deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's overall summary across all workspaces
// @route   GET /api/users/me/summary
// @access  Private
export const getMySummary = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).populate(
      'workspace'
    );

    let totalOwed = 0;
    let totalOwing = 0;
    const breakdown = [];

    for (const membership of memberships) {
      if (!membership.workspace) continue;

      const balancesMap = await calculateBalances(membership.workspace._id);
      const balancesArray = balancesToArray(balancesMap);
      const summary = getUserSummary(balancesArray, req.user._id);

      totalOwed += summary.totalOwed;
      totalOwing += summary.totalOwing;

      breakdown.push({
        workspace: {
          _id: membership.workspace._id,
          name: membership.workspace.name,
          type: membership.workspace.type,
        },
        role: membership.role,
        owed: summary.totalOwed,
        owing: summary.totalOwing,
        net: Math.round((summary.totalOwed - summary.totalOwing) * 100) / 100,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalOwed: Math.round(totalOwed * 100) / 100,
        totalOwing: Math.round(totalOwing * 100) / 100,
        net: Math.round((totalOwed - totalOwing) * 100) / 100,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};