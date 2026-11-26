function clampDueDay(year, monthIndex, dueDay) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(31, Math.max(1, Math.trunc(dueDay) || 1), lastDay);
}

/**
 * Attaches the next due date inside the current cycle to unpaid active bills.
 * @param {{ fixedBills: Array, today: Date, cycle: { start: Date, end: Date, key: string } }} input
 */
export function getUpcomingFixedBills({ fixedBills, today, cycle }) {
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = [];

  for (const bill of fixedBills) {
    if (!bill.active || bill.paidCycleKey === cycle.key) continue;
    let year = today.getFullYear();
    let monthIndex = today.getMonth();
    while (new Date(year, monthIndex, 1) < cycle.end) {
      const dueDate = new Date(year, monthIndex, clampDueDay(year, monthIndex, bill.dueDay), 12);
      if (dueDate >= startToday && dueDate >= cycle.start && dueDate < cycle.end) {
        upcoming.push({ ...bill, dueDate });
      }
      monthIndex += 1;
      if (monthIndex > 11) {
        year += 1;
        monthIndex = 0;
      }
    }
  }

  return upcoming.sort((left, right) => left.dueDate - right.dueDate);
}

/** Returns variable expenses for a local calendar day. */
export function sumVariableExpensesToday(transactions, today) {
  return transactions.reduce((total, transaction) => {
    const date = transaction.date;
    if (
      transaction.type !== 'expense' ||
      transaction.debtId ||
      transaction.fixedBillId ||
      !(date instanceof Date) ||
      !Number.isSafeInteger(transaction.amount) ||
      date.getFullYear() !== today.getFullYear() ||
      date.getMonth() !== today.getMonth() ||
      date.getDate() !== today.getDate()
    ) {
      return total;
    }
    return total + transaction.amount;
  }, 0);
}

/** Sums unpaid debts owed by the user that fall due by the current cycle end. */
export function sumDebtsDue(debts, cycleEnd) {
  return debts.reduce((total, debt) => {
    if (
      debt.status !== 'open' ||
      debt.direction !== 'i_owe' ||
      !(debt.dueDate instanceof Date) ||
      debt.dueDate > cycleEnd ||
      !Number.isSafeInteger(debt.amount) ||
      !Number.isSafeInteger(debt.paidAmount)
    ) {
      return total;
    }
    return total + Math.max(0, debt.amount - debt.paidAmount);
  }, 0);
}
