import { describe, expect, it } from 'vitest';
import { buildNotification } from './buildNotification.js';

const today = new Date(2026, 5, 10, 12);
const profile = {
  displayName: 'Sinta Putri',
  gender: 'female',
  age: 22,
  birthDate: '2004-08-10',
};
const summary = {
  dailyAllowance: 85_000,
  remainingToday: 45_000,
  spentToday: 40_000,
  daysLeft: 12,
  budgetsNearLimit: [],
  billsDueSoon: [],
  debtsDueSoon: [],
};

describe('buildNotification morning slot', () => {
  it('prioritizes a birthday and includes the daily allowance', () => {
    const result = buildNotification({
      slot: 'morning',
      profile: { ...profile, birthDate: '2004-06-10' },
      summary: { ...summary, billsDueSoon: [{ name: 'Listrik', amount: 350_000, daysUntil: 0 }] },
      today,
    });

    expect(result.body).toContain('Selamat ulang tahun yang ke-22, Mbak Sinta');
    expect(result.body).toContain('Rp 85.000');
  });

  it('celebrates a February 29 birthday on February 28 in a non-leap year', () => {
    const result = buildNotification({
      slot: 'morning',
      profile: { ...profile, birthDate: '2004-02-29', age: 21 },
      summary,
      today: new Date(2026, 1, 28, 8),
    });

    expect(result.body).toContain('Selamat ulang tahun yang ke-22');
  });

  it('prioritizes a bill due today or tomorrow', () => {
    const result = buildNotification({
      slot: 'morning',
      profile,
      summary: {
        ...summary,
        billsDueSoon: [{ name: 'Listrik', amount: 350_000, daysUntil: 1 }],
      },
      today,
    });

    expect(result.body).toContain('Tagihan Listrik Rp 350.000 jatuh tempo besok');
    expect(result.body).toContain('Jatah harianmu Rp 85.000');
  });

  it('describes a debt due soon', () => {
    const result = buildNotification({
      slot: 'morning',
      profile,
      summary: {
        ...summary,
        debtsDueSoon: [
          { personName: 'Andi', direction: 'owed_to_me', amount: 75_000, daysUntil: 0 },
        ],
      },
      today,
    });

    expect(result.body).toContain('Piutang dari Andi Rp 75.000 jatuh tempo hari ini');
  });

  it('uses the young default greeting when there is no birthday or due item', () => {
    expect(buildNotification({ slot: 'morning', profile, summary, today }).body).toContain(
      'Pagi, Mbak Sinta! Jatah hari ini Rp 85.000, 12 hari lagi gajian. Semangat!',
    );
  });

  it('uses the adult default greeting', () => {
    const result = buildNotification({
      slot: 'morning',
      profile: { ...profile, age: 31 },
      summary,
      today,
    });

    expect(result.body).toContain('Selamat pagi, Mbak Sinta. Jatah hari ini Rp 85.000');
  });
});

describe('buildNotification noon slot', () => {
  it('prioritizes the budget nearest its limit', () => {
    const result = buildNotification({
      slot: 'noon',
      profile,
      summary: {
        ...summary,
        spentToday: 0,
        budgetsNearLimit: [
          { name: 'Makan', percent: 90 },
          { name: 'Jajan', percent: 92 },
        ],
      },
      today,
    });

    expect(result.body).toContain('Anggaran Jajan sudah 92%');
  });

  it('reminds the user to record a day with no transactions', () => {
    const result = buildNotification({
      slot: 'noon',
      profile,
      summary: { ...summary, spentToday: 0 },
      today,
    });

    expect(result.body).toContain('Belum ada catatan hari ini. Sudah makan siang?');
  });

  it('summarizes the young user’s spending and remaining allowance', () => {
    const result = buildNotification({ slot: 'noon', profile, summary, today });

    expect(result.body).toContain('Rp 40.000');
    expect(result.body).toContain('Rp 45.000');
  });

  it('uses the adult noon summary', () => {
    const result = buildNotification({
      slot: 'noon',
      profile: { ...profile, age: 25 },
      summary,
      today,
    });

    expect(result.body).toContain('Sampai siang ini terpakai Rp 40.000 dari jatah Rp 85.000');
  });
});

describe('buildNotification evening slot', () => {
  it('prioritizes a negative remaining allowance', () => {
    const result = buildNotification({
      slot: 'evening',
      profile,
      summary: {
        ...summary,
        remainingToday: -20_000,
        debtsDueSoon: [
          { personName: 'Andi', direction: 'owed_to_me', amount: 75_000, daysUntil: 1 },
        ],
      },
      today,
    });

    expect(result.body).toContain('Hari ini lewat jatah Rp 20.000');
  });

  it('reminds the user of a debt due within three days', () => {
    const result = buildNotification({
      slot: 'evening',
      profile,
      summary: {
        ...summary,
        debtsDueSoon: [
          { personName: 'Andi', direction: 'owed_to_me', amount: 75_000, daysUntil: 2 },
        ],
      },
      today,
    });

    expect(result.body).toContain('Piutang dari Andi Rp 75.000 jatuh tempo dalam 2 hari');
  });

  it('uses the young default recap', () => {
    const result = buildNotification({ slot: 'evening', profile, summary, today });

    expect(result.body).toContain('terpakai Rp 40.000, sisa jatah Rp 45.000');
    expect(result.body).toContain('Mbak Sinta');
  });

  it('uses the adult default recap', () => {
    const result = buildNotification({
      slot: 'evening',
      profile: { ...profile, age: 25 },
      summary,
      today,
    });

    expect(result.body).toContain('Sudah catat semua, Mbak Sinta?');
  });
});

describe('buildNotification amount privacy', () => {
  it.each(['morning', 'noon', 'evening'])('omits rupiah amounts in the %s slot', (slot) => {
    const result = buildNotification({ slot, profile, summary, today, hideAmounts: true });

    expect(result.body).not.toMatch(/Rp\s?\d/);
  });

  it('keeps the birthday message while omitting the daily allowance', () => {
    const result = buildNotification({
      slot: 'morning',
      profile: { ...profile, birthDate: '2004-06-10' },
      summary,
      today,
      hideAmounts: true,
    });

    expect(result.body).toContain('Selamat ulang tahun');
    expect(result.body).not.toContain('Rp');
  });

  it('returns null for an unsupported slot or invalid date', () => {
    expect(buildNotification({ slot: 'midnight', profile, summary, today })).toBeNull();
    expect(
      buildNotification({ slot: 'morning', profile, summary, today: new Date('invalid') }),
    ).toBeNull();
  });
});
