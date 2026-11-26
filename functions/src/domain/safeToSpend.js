import { getCycle } from './dates.js';
import { MILLISECONDS_PER_DAY } from './constants.js';

function localDayNumber(date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY,
  );
}

function clampDueDay(year, monthIndex, dueDay) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(31, Math.max(1, Math.trunc(dueDay) || 1), lastDay);
}

/** Sums unpaid debts owed by the user that fall due by the current cycle end. */
export function sumDebtsDue(debts, cycleEnd) {
  return debts.reduce((total, debt) => {
    if (
      debt.status !== 'open' ||
      debt.direction !== 'i_owe' ||
      !(debt.dueDate instanceof Date) ||
      localDayNumber(debt.dueDate) > localDayNumber(cycleEnd) ||
      !Number.isSafeInteger(debt.amount) ||
      !Number.isSafeInteger(debt.paidAmount)
    ) {
      return total;
    }
    return total + Math.max(0, debt.amount - debt.paidAmount);
  }, 0);
}

/**
 * Calculates today's conservative spending allowance for a payday cycle.
 * @param {{ balance: number, fixedBills: Array, debts: Array, spentToday: number, paydayDay: number, today: Date }} input
 */
export function calculateSafeToSpend({ balance, fixedBills, debts, spentToday, paydayDay, today }) {
  const { end: cycleEnd } = getCycle(today, paydayDay);
  const todayNumber = localDayNumber(today);
  const daysLeft = Math.max(1, localDayNumber(cycleEnd) - todayNumber);
  const remainingBills = fixedBills.reduce((total, bill) => {
    if (!bill.active || !(bill.dueDate instanceof Date)) return total;
    return bill.dueDate < cycleEnd &&
      bill.dueDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ? total + bill.amount
      : total;
  }, 0);
  const debtsDue = sumDebtsDue(debts, cycleEnd);
  const pool = balance + spentToday - remainingBills - debtsDue;
  const dailyAllowance = Math.max(0, Math.floor(pool / daysLeft));

  return {
    dailyAllowance,
    remainingToday: dailyAllowance - spentToday,
    daysLeft,
    remainingBills,
    debtsDue,
    cycleEnd,
  };
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
