import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORIES } from '../../shared/constants/categories.js';
import { parseQuickAdd } from './parseQuickAdd.js';

const today = new Date(2026, 10, 26, 9);
const people = [
  { id: 'budi', name: 'Budi' },
  { id: 'andi', name: 'Andi' },
];
const parse = (text) => parseQuickAdd(text, { categories: DEFAULT_CATEGORIES, people, today });

describe('parseQuickAdd examples', () => {
  it.each([
    ['beli kopi 25rb', 'expense', 25000, 'jajan'],
    ['gajian 5jt', 'income', 5000000, 'gaji'],
    ['bensin 50.000', 'expense', 50000, 'transport'],
    ['kemarin makan siang 35k', 'expense', 35000, 'makan'],
    ['ngopi 2,5k', 'expense', 2500, 'jajan'],
  ])('%s parses to its expected transaction', (text, type, amount, categoryId) => {
    const parsed = parse(text);
    expect(parsed).toMatchObject({ type, amount, categoryId });
  });

  it('uses yesterday for kemarin and keeps the note clean', () => {
    const parsed = parse('kemarin makan siang 35k');
    expect(parsed.date).toEqual(new Date(2026, 10, 25));
    expect(parsed.note).toBe('makan siang');
  });

  it('uses the supplied today date by default without changing it', () => {
    const parsed = parse('beli air 5rb');
    expect(parsed.date).toEqual(new Date(2026, 10, 26));
    expect(today).toEqual(new Date(2026, 10, 26, 9));
  });

  it('returns a low confidence preview when no amount or category is found', () => {
    expect(parse('halo')).toMatchObject({ amount: null, categoryId: null, confidence: 'low' });
  });
});

describe('parseQuickAdd amount rules', () => {
  it.each([
    ['1.500.000', 1500000],
    ['Rp 25.000', 25000],
    ['2,5jt', 2500000],
    ['1.5k', 1500],
    ['harga 20 dan 50', 50],
    ['harga 20 dan Rp 10', 10],
  ])('parses %s as %i rupiah', (text, amount) => {
    expect(parse(text).amount).toBe(amount);
  });

  it('prefers an amount with a suffix over a larger plain number', () => {
    expect(parse('target 2026 beli kopi 25rb').amount).toBe(25000);
  });

  it('returns null for values above the safe integer range', () => {
    expect(parse('999999999999999999999')).toMatchObject({ amount: null, confidence: 'low' });
  });
});

describe('parseQuickAdd dates and debt phrases', () => {
  it.each([
    ['lusa jalan 10rb', new Date(2026, 10, 28)],
    ['tadi beli roti 8rb', new Date(2026, 10, 26)],
  ])('applies the relative date in %s', (text, date) => {
    expect(parse(text).date).toEqual(date);
  });

  it.each([
    ['minjemin budi 100rb', 'owed_to_me', 'Budi', true, 'expense'],
    ['pinjemin budi 100rb', 'owed_to_me', 'Budi', true, 'expense'],
    ['pinjam ke andi 75rb', 'i_owe', 'Andi', true, 'income'],
    ['utang ke andi 75rb', 'i_owe', 'Andi', false, 'expense'],
    ['andi utang 75rb', 'owed_to_me', 'Andi', false, 'expense'],
    ['andi bayar utang 50rb', 'owed_to_me', 'Andi', true, 'income'],
    ['bayar utang ke andi 50rb', 'i_owe', 'Andi', true, 'expense'],
  ])('parses debt phrase %s', (text, direction, personName, affectsCash, type) => {
    const expectedAmount = text.includes('50rb') ? 50000 : text.includes('75rb') ? 75000 : 100000;
    expect(parse(text)).toMatchObject({
      type,
      amount: expectedAmount,
      categoryId: null,
      debt: { direction, personName, affectsCash },
    });
    if (text.includes('bayar utang')) expect(parse(text).debt.repayment).toBe(true);
  });

  it('extracts and capitalizes a person name when no people list match exists', () => {
    const parsed = parseQuickAdd('minjemin sinta 20rb', { categories: DEFAULT_CATEGORIES, today });
    expect(parsed.debt.personName).toBe('Sinta');
  });
});
