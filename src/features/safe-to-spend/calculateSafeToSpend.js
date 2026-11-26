import { getCycle } from '../../shared/utils/dates.js';
import { MILLISECONDS_PER_DAY } from '../../shared/constants/dates.js';

function localDayNumber(date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY,
  );
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
  const debtsDue = debts.reduce((total, debt) => {
    if (
      debt.status !== 'open' ||
      debt.direction !== 'i_owe' ||
      !(debt.dueDate instanceof Date) ||
      debt.dueDate > cycleEnd
    ) {
      return total;
    }
    return total + Math.max(0, debt.amount - debt.paidAmount);
  }, 0);
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
