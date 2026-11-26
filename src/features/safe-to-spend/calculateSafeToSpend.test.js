import { describe, expect, it } from 'vitest';
import { calculateSafeToSpend } from './calculateSafeToSpend.js';
import { getUpcomingFixedBills, sumDebtsDue, sumVariableExpensesToday } from './safeToSpendMath.js';
import { getCycle } from '../../shared/utils/dates.js';

const today = new Date(2026, 10, 26, 8);

describe('calculateSafeToSpend', () => {
  it('reserves upcoming bills and debts before splitting the remaining pool', () => {
    const result = calculateSafeToSpend({
      balance: 3000000,
      fixedBills: [
        { amount: 350000, active: true, dueDate: new Date(2026, 11, 2) },
        { amount: 900000, active: true, dueDate: new Date(2027, 0, 4) },
      ],
      debts: [
        {
          amount: 300000,
          paidAmount: 50000,
          direction: 'i_owe',
          status: 'open',
          dueDate: new Date(2026, 11, 8),
        },
        {
          amount: 500000,
          paidAmount: 0,
          direction: 'owed_to_me',
          status: 'open',
          dueDate: new Date(2026, 11, 1),
        },
      ],
      spentToday: 40000,
      paydayDay: 25,
      today,
    });

    expect(result).toMatchObject({
      dailyAllowance: 84137,
      remainingToday: 44137,
      daysLeft: 29,
      remainingBills: 350000,
      debtsDue: 250000,
      cycleEnd: new Date(2026, 11, 25),
    });
  });

  it('keeps a negative remainingToday while never returning a negative allowance', () => {
    const result = calculateSafeToSpend({
      balance: -100000,
      fixedBills: [],
      debts: [],
      spentToday: 80000,
      paydayDay: 25,
      today,
    });
    expect(result.dailyAllowance).toBe(0);
    expect(result.remainingToday).toBe(-80000);
  });

  it('uses at least one day and clamps a negative pool to zero', () => {
    const payday = new Date(2026, 10, 25);
    const result = calculateSafeToSpend({
      balance: 0,
      fixedBills: [],
      debts: [],
      spentToday: 0,
      paydayDay: 25,
      today: payday,
    });
    expect(result).toMatchObject({ dailyAllowance: 0, daysLeft: 30 });
  });
});

describe('getUpcomingFixedBills', () => {
  it('clamps payday-month due days and skips bills paid this cycle', () => {
    const cycle = getCycle(new Date(2026, 1, 20), 1);
    const bills = getUpcomingFixedBills({
      today: new Date(2026, 1, 20),
      cycle,
      fixedBills: [
        { id: 'rent', name: 'Kos', amount: 1000000, dueDay: 31, active: true },
        { id: 'paid', amount: 500, dueDay: 22, active: true, paidCycleKey: cycle.key },
        { id: 'inactive', amount: 500, dueDay: 22, active: false },
      ],
    });
    expect(bills).toHaveLength(1);
    expect(bills[0].dueDate).toEqual(new Date(2026, 1, 28, 12));
  });
});

describe('sumVariableExpensesToday', () => {
  it('excludes debt and fixed bill payments', () => {
    expect(
      sumVariableExpensesToday(
        [
          { amount: 20000, type: 'expense', date: today, categoryId: 'food' },
          { amount: 40000, type: 'expense', date: today, debtId: 'debt' },
          { amount: 80000, type: 'expense', date: today, fixedBillId: 'bill' },
          { amount: 50000, type: 'income', date: today },
        ],
        today,
      ),
    ).toBe(20000);
  });
});

describe('sumDebtsDue', () => {
  it('reserves only open debts the user owes with a due date in the cycle', () => {
    expect(
      sumDebtsDue(
        [
          {
            amount: 100000,
            paidAmount: 25000,
            direction: 'i_owe',
            status: 'open',
            dueDate: new Date(2026, 11, 1),
          },
          {
            amount: 200000,
            paidAmount: 0,
            direction: 'owed_to_me',
            status: 'open',
            dueDate: new Date(2026, 11, 1),
          },
          {
            amount: 200000,
            paidAmount: 0,
            direction: 'i_owe',
            status: 'settled',
            dueDate: new Date(2026, 11, 1),
          },
          { amount: 200000, paidAmount: 0, direction: 'i_owe', status: 'open', dueDate: null },
        ],
        new Date(2026, 11, 25),
      ),
    ).toBe(75000);
  });
});
