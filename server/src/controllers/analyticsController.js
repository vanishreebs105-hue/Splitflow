import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

// @desc    Get workspace analytics
// @route   GET /api/workspaces/:workspaceId/analytics/overview
// @access  Private (VIEWER+)
export const getWorkspaceAnalytics = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const expenses = await Expense.find({
      workspace: workspaceId,
      isDeleted: false,
    });

    const settlements = await Settlement.find({ workspace: workspaceId });

    // Total amounts
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSettlements = settlements.reduce((sum, s) => sum + s.amount, 0);
    const totalTransactions = expenses.length;

    // Category breakdown
    const categoryBreakdown = {};
    for (const exp of expenses) {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    }

    // Convert to array sorted by amount
    const byCategory = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const monthlyTrend = await getMonthlyTrend(workspaceId);

    // Member contributions (who paid how much)
    const memberContributions = {};
    for (const exp of expenses) {
      const payerId = exp.paidBy.toString();
      memberContributions[payerId] = (memberContributions[payerId] || 0) + exp.amount;
    }

    const byMember = Object.entries(memberContributions)
      .map(([userId, amount]) => ({ user: userId, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount);

    // Average expense
    const avgExpense = totalTransactions > 0 ? round2(totalExpenses / totalTransactions) : 0;

    // Largest expense
    const largestExpense = expenses.length > 0
      ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
      : null;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalExpenses: round2(totalExpenses),
          totalSettlements: round2(totalSettlements),
          totalTransactions,
          avgExpense,
        },
        byCategory,
        byMember,
        monthlyTrend,
        largestExpense: largestExpense
          ? {
              _id: largestExpense._id,
              title: largestExpense.title,
              amount: largestExpense.amount,
              category: largestExpense.category,
              date: largestExpense.date,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity feed
// @route   GET /api/workspaces/:workspaceId/analytics/activity
// @access  Private (VIEWER+)
export const getActivityFeed = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 20 } = req.query;

    const [expenses, settlements] = await Promise.all([
      Expense.find({ workspace: workspaceId, isDeleted: false })
        .populate('paidBy', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Settlement.find({ workspace: workspaceId })
        .populate('from', 'name email avatar')
        .populate('to', 'name email avatar')
        .populate('recordedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
    ]);

    // Merge and mark types
    const activities = [
      ...expenses.map((e) => ({
        type: 'expense',
        id: e._id,
        user: e.paidBy,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.createdAt,
      })),
      ...settlements.map((s) => ({
        type: 'settlement',
        id: s._id,
        user: s.from,
        to: s.to,
        amount: s.amount,
        note: s.note,
        date: s.createdAt,
      })),
    ];

    // Sort by date, most recent first
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities: activities.slice(0, Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/workspaces/:workspaceId/analytics/export
// @access  Private (VIEWER+)
export const exportExpensesCSV = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const expenses = await Expense.find({
      workspace: workspaceId,
      isDeleted: false,
    })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ date: -1 });

    // Build CSV
    const headers = ['Date', 'Title', 'Description', 'Category', 'Amount', 'Paid By', 'Split Mode', 'Participants'];
    const rows = expenses.map((e) => [
      new Date(e.date).toISOString().split('T')[0],
      e.title,
      e.description || '',
      e.category,
      e.amount,
      e.paidBy?.name || 'Unknown',
      e.splitMode,
      e.splits.map((s) => s.user?.name || 'Unknown').join('; '),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses-${workspaceId}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// ============ HELPERS ============

const round2 = (num) => Math.round(num * 100) / 100;

async function getMonthlyTrend(workspaceId) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const expenses = await Expense.find({
    workspace: workspaceId,
    isDeleted: false,
    date: { $gte: sixMonthsAgo },
  });

  // Group by YYYY-MM
  const monthly = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = { month: key, total: 0, count: 0 };
  }

  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthly[key]) {
      monthly[key].total = round2(monthly[key].total + exp.amount);
      monthly[key].count += 1;
    }
  }

  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
}