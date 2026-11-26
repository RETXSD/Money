/** @typedef {{ id: string, limit: number }} Budget */
/** @typedef {{ categoryId: string|null, amount: number, type: string, debtId?: string|null }} Transaction */

/**
 * Builds current-cycle category progress from integer-rupiah records.
 * @param {{ categories: Array, budgets: Budget[], transactions: Transaction[] }} input
 * @returns {Array<{ category: object, limit: number, spent: number, remaining: number, percent: number, status: string }>}
 */
export function calculateBudgetProgress({ categories, budgets, transactions }) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const budgetByCategory = new Map(
    budgets
      .filter((budget) => Number.isSafeInteger(budget.limit) && budget.limit > 0)
      .map((budget) => [budget.categoryId, budget.limit]),
  );
  const spendingByCategory = new Map();

  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.debtId ||
      !transaction.categoryId ||
      !Number.isSafeInteger(transaction.amount) ||
      transaction.amount <= 0
    ) {
      continue;
    }
    spendingByCategory.set(
      transaction.categoryId,
      (spendingByCategory.get(transaction.categoryId) || 0) + transaction.amount,
    );
  }

  return [...budgetByCategory.entries()]
    .map(([categoryId, limit]) => {
      const category = categoryById.get(categoryId);
      if (!category || category.type !== 'expense') return null;
      const spent = spendingByCategory.get(categoryId) || 0;
      const percent = Math.floor((spent * 100) / limit);
      return {
        category,
        limit,
        spent,
        remaining: limit - spent,
        percent,
        status: percent < 75 ? 'green' : percent <= 100 ? 'yellow' : 'red',
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.category.name.localeCompare(right.category.name, 'id'));
}

/**
 * Returns the allocation warning when saved budgets exceed spendable funds.
 * @param {Array<Budget>} budgets
 * @param {number|null} availableFunds Rupiah available after reserved bills and debts.
 */
export function getBudgetAllocationWarning(budgets, availableFunds) {
  if (!Number.isSafeInteger(availableFunds)) return null;
  const totalLimit = budgets.reduce(
    (total, budget) => total + (Number.isSafeInteger(budget.limit) ? budget.limit : 0),
    0,
  );
  return totalLimit > availableFunds
    ? { totalLimit, availableFunds, shortfall: totalLimit - availableFunds }
    : null;
}
