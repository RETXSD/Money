import { describe, expect, it } from 'vitest';
import { calculateBudgetProgress, getBudgetAllocationWarning } from './budgetMath.js';

const categories = [
  { id: 'food', name: 'Makan', type: 'expense' },
  { id: 'fun', name: 'Jajan', type: 'expense' },
  { id: 'salary', name: 'Gaji', type: 'income' },
];

describe('calculateBudgetProgress', () => {
  it('aggregates current expenses and returns the envelope status', () => {
    const result = calculateBudgetProgress({
      categories,
      budgets: [
        { categoryId: 'food', limit: 800000 },
        { categoryId: 'fun', limit: 300000 },
        { categoryId: 'salary', limit: 1000000 },
      ],
      transactions: [
        { categoryId: 'food', amount: 250000, type: 'expense' },
        { categoryId: 'food', amount: 400000, type: 'expense' },
        { categoryId: 'fun', amount: 305000, type: 'expense' },
        { categoryId: null, amount: 100000, type: 'expense', debtId: 'd1' },
        { categoryId: 'food', amount: 1000000, type: 'income' },
      ],
    });

    expect(result).toEqual([
      expect.objectContaining({
        category: categories[1],
        spent: 305000,
        remaining: -5000,
        percent: 101,
        status: 'red',
      }),
      expect.objectContaining({
        category: categories[0],
        spent: 650000,
        remaining: 150000,
        percent: 81,
        status: 'yellow',
      }),
    ]);
  });

  it('uses green below 75 percent and excludes orphaned budgets', () => {
    expect(
      calculateBudgetProgress({
        categories,
        budgets: [
          { categoryId: 'food', limit: 800000 },
          { categoryId: 'removed', limit: 5000 },
        ],
        transactions: [{ categoryId: 'food', amount: 599999, type: 'expense' }],
      })[0].status,
    ).toBe('green');
  });
});

describe('getBudgetAllocationWarning', () => {
  it('warns when total category limits exceed funds', () => {
    expect(getBudgetAllocationWarning([{ limit: 800000 }, { limit: 300000 }], 1000000)).toEqual({
      totalLimit: 1100000,
      availableFunds: 1000000,
      shortfall: 100000,
    });
  });

  it('does not warn when funds cover the budgets or are not loaded', () => {
    expect(getBudgetAllocationWarning([{ limit: 800000 }], 800000)).toBeNull();
    expect(getBudgetAllocationWarning([{ limit: 800000 }], null)).toBeNull();
  });
});
