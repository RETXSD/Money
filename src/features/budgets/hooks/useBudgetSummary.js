import { useCategories } from '../../categories/hooks/useCategories.js';
import { useTransactions } from '../../transactions/hooks/useTransactions.js';
import { getCycle } from '../../../shared/utils/dates.js';
import { useBudgetSettings } from './useBudgetSettings.js';
import { useBudgets } from './useBudgets.js';
import { calculateBudgetProgress, getBudgetAllocationWarning } from '../budgetMath.js';

function getTodayRange(today) {
  return {
    start: new Date(1900, 0, 1),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  };
}

export function useBudgetSummary(uid) {
  const today = new Date();
  const categories = useCategories(uid);
  const budgets = useBudgets(uid);
  const settings = useBudgetSettings(uid);
  const paydayDay = settings.data?.paydayDay || 25;
  const cycle = getCycle(today, paydayDay);
  const cycleTransactions = useTransactions(uid, {
    startDate: cycle.start,
    endDate: cycle.end,
    categoryId: '',
  });
  const balanceRange = getTodayRange(today);
  const balanceTransactions = useTransactions(uid, {
    startDate: settings.data?.balanceBaseDate || balanceRange.start,
    endDate: balanceRange.end,
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
  const allocationWarning = getBudgetAllocationWarning(
    progress.map((item) => ({ limit: item.limit })),
    balance,
  );
  const loading =
    categories.loading ||
    budgets.loading ||
    settings.loading ||
    cycleTransactions.loading ||
    balanceTransactions.loading;
  const error =
    categories.error ||
    budgets.error ||
    settings.error ||
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
    transactions: cycleTransactions.data,
  };
}
