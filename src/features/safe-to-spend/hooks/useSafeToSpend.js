import { useBudgetSettings } from '../../budgets/hooks/useBudgetSettings.js';
import { useFixedBills } from '../../budgets/hooks/useFixedBills.js';
import { useTransactions } from '../../transactions/hooks/useTransactions.js';
import { calculateSafeToSpend } from '../calculateSafeToSpend.js';
import { getUpcomingFixedBills, sumVariableExpensesToday } from '../safeToSpendMath.js';
import { getCycle } from '../../../shared/utils/dates.js';
import { DEFAULT_PAYDAY_DAY } from '../../../shared/constants/budget.js';
import { useDebts } from '../../debts/hooks/useDebts.js';

export function useSafeToSpend(uid) {
  const today = new Date();
  const settings = useBudgetSettings(uid);
  const fixedBills = useFixedBills(uid);
  const debts = useDebts(uid);
  const paydayDay = settings.data?.paydayDay || DEFAULT_PAYDAY_DAY;
  const cycle = getCycle(today, paydayDay);
  const cycleTransactions = useTransactions(uid, {
    startDate: cycle.start,
    endDate: cycle.end,
    categoryId: '',
  });
  const balanceTransactions = useTransactions(uid, {
    startDate: settings.data?.balanceBaseDate || cycle.start,
    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    categoryId: '',
  });
  const billsDue = getUpcomingFixedBills({ fixedBills: fixedBills.data, today, cycle });
  const balance =
    (settings.data?.balanceBase || 0) +
    balanceTransactions.data.reduce(
      (total, transaction) =>
        total + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
      0,
    );
  const safe = calculateSafeToSpend({
    balance,
    fixedBills: billsDue,
    debts: debts.data,
    spentToday: sumVariableExpensesToday(cycleTransactions.data, today),
    paydayDay,
    today,
  });
  const error =
    settings.error ||
    fixedBills.error ||
    debts.error ||
    cycleTransactions.error ||
    balanceTransactions.error;

  return {
    balance,
    billsDue,
    cycle,
    error,
    loading:
      settings.loading ||
      fixedBills.loading ||
      debts.loading ||
      cycleTransactions.loading ||
      balanceTransactions.loading,
    paydayDay,
    safe,
  };
}
