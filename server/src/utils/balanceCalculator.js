import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

const round2 = (num) => Math.round(num * 100) / 100;

/**
 * Calculate net balance for every member of a workspace.
 *
 * Returns a Map: { userId: netBalance }
 *   positive = they are OWED money (creditor)
 *   negative = they OWE money (debtor)
 *   zero = settled
 *
 * Logic:
 *   For each expense:
 *     - The payer paid `amount` → they get +amount credit
 *     - Each split participant owes `split.amount` → they get -amount
 *   For each settlement:
 *     - `from` paid `to` → from gets +amount, to gets -amount
 */
export const calculateBalances = async (workspaceId) => {
  const balances = new Map();

  const addToBalance = (userId, amount) => {
    const key = userId.toString();
    const current = balances.get(key) || 0;
    balances.set(key, round2(current + amount));
  };

  // Get all active expenses
  const expenses = await Expense.find({
    workspace: workspaceId,
    isDeleted: false,
  });

  for (const exp of expenses) {
    // Payer paid the full amount → gets credit
    addToBalance(exp.paidBy, exp.amount);

    // Each participant owes their split share
    for (const split of exp.splits) {
      addToBalance(split.user, -split.amount);
    }
  }

  // Get all settlements (payments already made)
  const settlements = await Settlement.find({ workspace: workspaceId });

  for (const s of settlements) {
    // The person who paid the settlement gets credit (reduces their debt)
    addToBalance(s.from, s.amount);
    // The person who received it owes less
    addToBalance(s.to, -s.amount);
  }

  return balances;
};

/**
 * Convert Map → Array of { userId, balance } objects
 */
export const balancesToArray = (balancesMap) => {
  const arr = [];
  for (const [userId, balance] of balancesMap.entries()) {
    arr.push({ user: userId, balance });
  }
  return arr;
};

/**
 * Aggregate total owed/owed amounts for a single user across all their workspaces
 */
export const getUserSummary = (balancesArray, userId) => {
  let totalOwed = 0; // Others owe me
  let totalOwing = 0; // I owe others

  const uid = userId.toString();
  for (const { user, balance } of balancesArray) {
    if (user.toString() === uid) {
      if (balance > 0) totalOwed = balance;
      else if (balance < 0) totalOwing = Math.abs(balance);
      break;
    }
  }

  return { totalOwed, totalOwing };
};