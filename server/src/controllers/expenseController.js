import Expense from '../models/Expense.js';
import Membership from '../models/Membership.js';
import { calculateSplits } from '../utils/splitCalculator.js';

// @desc    Create expense
// @route   POST /api/workspaces/:workspaceId/expenses
// @access  Private (MEMBER+)
export const createExpense = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const {
      title,
      description,
      amount,
      currency,
      category,
      paidBy,
      splitMode,
      splits: rawSplits,
      date,
      isRecurring,
      recurringFrequency,
    } = req.body;

    // Verify payer is a workspace member
    const payerMembership = await Membership.findOne({
      user: paidBy,
      workspace: workspaceId,
    });
    if (!payerMembership) {
      return res.status(400).json({
        success: false,
        message: 'Payer must be a member of this workspace',
      });
    }

    // Verify ALL split participants are workspace members
    const participantIds = rawSplits.map((s) => s.user);
    const memberships = await Membership.find({
      user: { $in: participantIds },
      workspace: workspaceId,
    });

    if (memberships.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'All participants must be members of this workspace',
      });
    }

    // Calculate splits based on mode
    let calculatedSplits;
    try {
      calculatedSplits = calculateSplits(splitMode, amount, rawSplits);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Create the expense
    const expense = await Expense.create({
      workspace: workspaceId,
      title,
      description,
      amount,
      currency,
      category,
      paidBy,
      splitMode,
      splits: calculatedSplits,
      date,
      isRecurring,
      recurringFrequency,
      createdBy: req.user._id,
    });

    // Populate for response
    await expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'splits.user', select: 'name email avatar' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for a workspace
// @route   GET /api/workspaces/:workspaceId/expenses
// @access  Private (VIEWER+)
export const getExpenses = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { category, paidBy, startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build filter
    const filter = { workspace: workspaceId, isDeleted: false };
    if (category) filter.category = category;
    if (paidBy) filter.paidBy = paidBy;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('paidBy', 'name email avatar')
        .populate('splits.user', 'name email avatar')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { expenses },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/workspaces/:workspaceId/expenses/:expenseId
// @access  Private (VIEWER+)
export const getExpense = async (req, res, next) => {
  try {
    const { workspaceId, expenseId } = req.params;

    const expense = await Expense.findOne({
      _id: expenseId,
      workspace: workspaceId,
      isDeleted: false,
    })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/workspaces/:workspaceId/expenses/:expenseId
// @access  Private (MEMBER+)
export const updateExpense = async (req, res, next) => {
  try {
    const { workspaceId, expenseId } = req.params;

    const expense = await Expense.findOne({
      _id: expenseId,
      workspace: workspaceId,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Only creator or workspace admin can update
    const isCreator = expense.createdBy.toString() === req.user._id.toString();
    const isAdminOrOwner = ['ADMIN', 'OWNER'].includes(req.membership.role);

    if (!isCreator && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only creator or admin can update this expense',
      });
    }

    const { title, description, amount, category, splits, splitMode, date } = req.body;

    // If amount or splits changed, recalculate
    if (amount !== undefined || splits !== undefined || splitMode !== undefined) {
      const newAmount = amount !== undefined ? amount : expense.amount;
      const newMode = splitMode || expense.splitMode;
      const newRawSplits = splits || expense.splits;

      try {
        expense.splits = calculateSplits(newMode, newAmount, newRawSplits);
        expense.splitMode = newMode;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
    }

    if (title !== undefined) expense.title = title;
    if (description !== undefined) expense.description = description;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;

    await expense.save();

    await expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'splits.user', select: 'name email avatar' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Expense updated',
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense (soft delete)
// @route   DELETE /api/workspaces/:workspaceId/expenses/:expenseId
// @access  Private (MEMBER+)
export const deleteExpense = async (req, res, next) => {
  try {
    const { workspaceId, expenseId } = req.params;

    const expense = await Expense.findOne({
      _id: expenseId,
      workspace: workspaceId,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const isCreator = expense.createdBy.toString() === req.user._id.toString();
    const isAdminOrOwner = ['ADMIN', 'OWNER'].includes(req.membership.role);

    if (!isCreator && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only creator or admin can delete this expense',
      });
    }

    expense.isDeleted = true;
    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense deleted',
    });
  } catch (error) {
    next(error);
  }
};