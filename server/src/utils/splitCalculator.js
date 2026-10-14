/**
 * Split Calculator — handles all 4 split modes
 *
 * Given an amount and an array of participants with their inputs,
 * returns a normalized array with calculated amounts.
 */

/**
 * Rounds to 2 decimal places safely
 */
const round2 = (num) => Math.round(num * 100) / 100;

/**
 * EQUAL SPLIT
 * Splits amount equally among all participants
 */
export const splitEqual = (amount, participants) => {
  if (participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  const share = round2(amount / participants.length);
  const splits = participants.map((p) => ({
    user: p.user,
    amount: share,
  }));

  // Fix rounding: last person absorbs the difference
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  const diff = round2(amount - total);
  if (diff !== 0) {
    splits[splits.length - 1].amount = round2(splits[splits.length - 1].amount + diff);
  }

  return splits;
};

/**
 * EXACT SPLIT
 * Each participant specifies exactly how much they owe.
 * Total must equal the expense amount.
 */
export const splitExact = (amount, participants) => {
  if (participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  const splits = participants.map((p) => {
    if (typeof p.amount !== 'number' || p.amount < 0) {
      throw new Error('Each participant must have a valid amount');
    }
    return {
      user: p.user,
      amount: round2(p.amount),
    };
  });

  const total = round2(splits.reduce((sum, s) => sum + s.amount, 0));

  if (Math.abs(total - amount) > 0.01) {
    throw new Error(
      `Exact splits total (${total}) must equal the expense amount (${amount})`
    );
  }

  return splits;
};

/**
 * PERCENTAGE SPLIT
 * Each participant specifies a percentage.
 * Total percentages must equal 100.
 */
export const splitPercentage = (amount, participants) => {
  if (participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  const totalPercentage = participants.reduce((sum, p) => {
    if (typeof p.percentage !== 'number' || p.percentage < 0) {
      throw new Error('Each participant must have a valid percentage');
    }
    return sum + p.percentage;
  }, 0);

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must add up to 100. Currently: ${totalPercentage}`);
  }

  const splits = participants.map((p) => ({
    user: p.user,
    amount: round2((amount * p.percentage) / 100),
    percentage: p.percentage,
  }));

  // Fix rounding
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  const diff = round2(amount - total);
  if (diff !== 0) {
    splits[splits.length - 1].amount = round2(splits[splits.length - 1].amount + diff);
  }

  return splits;
};

/**
 * SHARES SPLIT
 * Each participant specifies how many "shares" they take.
 * Amount is split proportionally to shares.
 */
export const splitShares = (amount, participants) => {
  if (participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  const totalShares = participants.reduce((sum, p) => {
    if (typeof p.shares !== 'number' || p.shares <= 0) {
      throw new Error('Each participant must have positive shares');
    }
    return sum + p.shares;
  }, 0);

  if (totalShares <= 0) {
    throw new Error('Total shares must be greater than 0');
  }

  const splits = participants.map((p) => ({
    user: p.user,
    amount: round2((amount * p.shares) / totalShares),
    shares: p.shares,
  }));

  // Fix rounding
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  const diff = round2(amount - total);
  if (diff !== 0) {
    splits[splits.length - 1].amount = round2(splits[splits.length - 1].amount + diff);
  }

  return splits;
};

/**
 * MASTER FUNCTION — routes to the right split method
 */
export const calculateSplits = (mode, amount, participants) => {
  switch (mode) {
    case 'equal':
      return splitEqual(amount, participants);
    case 'exact':
      return splitExact(amount, participants);
    case 'percentage':
      return splitPercentage(amount, participants);
    case 'shares':
      return splitShares(amount, participants);
    default:
      throw new Error(`Invalid split mode: ${mode}`);
  }
};