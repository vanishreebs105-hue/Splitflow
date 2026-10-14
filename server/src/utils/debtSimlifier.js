const round2 = (num) => Math.round(num * 100) / 100;

export const simplifyDebts = (balancesArray) => {
  const debtors = [];
  const creditors = [];

  for (const { user, balance } of balancesArray) {
    const b = round2(balance);
    if (b < -0.01) {
      debtors.push({ user, amount: Math.abs(b) });
    } else if (b > 0.01) {
      creditors.push({ user, amount: b });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = round2(Math.min(debtor.amount, creditor.amount));

    if (amount > 0.01) {
      transactions.push({
        from: debtor.user,
        to: creditor.user,
        amount,
      });
    }

    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};

export const calculateSavings = (balancesArray, transactions) => {
  const debtorsCount = balancesArray.filter((b) => b.balance < -0.01).length;
  const creditorsCount = balancesArray.filter((b) => b.balance > 0.01).length;

  const naiveTransactions = Math.max(0, debtorsCount + creditorsCount - 1);
  const optimizedTransactions = transactions.length;

  return {
    naiveTransactions,
    optimizedTransactions,
    saved: Math.max(0, naiveTransactions - optimizedTransactions),
  };
};