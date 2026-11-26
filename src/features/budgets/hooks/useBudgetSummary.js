import { useCategories } from '../../categories/hooks/useCategories.js';
import { useTransactions } from '../../transactions/hooks/useTransactions.js';
import { getCycle } from '../../../shared/utils/dates.js';
import { useBudgetSettings } from './useBudgetSettings.js';
import { useBudgets } from './useBudgets.js';
import { calculateBudgetProgress, getBudgetAllocationWarning } from '../budgetMath.js';
import { useFixedBills } from './useFixedBills.js';
import { getUpcomingFixedBills } from '../../safe-to-spend/safeToSpendMath.js';
import { DEFAULT_PAYDAY_DAY } from '../../../shared/constants/budget.js';

export function useBudgetSummary(uid) {
  const today = new Date();
  const categories = useCategories(uid);
  const budgets = useBudgets(uid);
  const settings = useBudgetSettings(uid);
  const fixedBills = useFixedBills(uid);
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
  const progress = calculateBudgetProgress({
    categories: categories.data,
    budgets: budgets.data,
    transactions: cycleTransactions.data,
  });
  const balance =
    (settings.data?.balanceBase || 0) +
    balanceTransactions.data.reduce(
      (total, transaction) =>
        total + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
      0,
    );
  const remainingBills = getUpcomingFixedBills({
    fixedBills: fixedBills.data,
    today,
    cycle,
  }).reduce((total, bill) => total + bill.amount, 0);
  const allocationWarning = getBudgetAllocationWarning(
    progress.map((item) => ({ limit: item.limit })),
    balance - remainingBills,
  );
  const loading =
    categories.loading ||
    budgets.loading ||
    settings.loading ||
    fixedBills.loading ||
    cycleTransactions.loading ||
    balanceTransactions.loading;
  const error =
    categories.error ||
    budgets.error ||
    settings.error ||
    fixedBills.error ||
    cycleTransactions.error ||
    balanceTransactions.error;

  return {
    allocationWarning,
    balance,
    budgets: budgets.data,
    categories: categories.data,
    cycle,
    error,
    loading,
    progress,
    remainingBills,
    transactions: cycleTransactions.data,
  };
}
