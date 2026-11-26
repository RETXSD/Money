import { describe, expect, it } from 'vitest';
import { formatRupiah, parseRupiahInput } from './money.js';

describe('formatRupiah', () => {
  it('formats whole rupiah amounts without decimal places', () => {
    expect(formatRupiah(25000).replace(/\u00a0/g, ' ')).toBe('Rp 25.000');
    expect(formatRupiah(0).replace(/\u00a0/g, ' ')).toBe('Rp 0');
  });

  it('does not format invalid values as money', () => {
    expect(formatRupiah(Number.NaN)).toBe('Rp 0');
  });
});

describe('parseRupiahInput', () => {
  it('accepts raw integers and formatted rupiah', () => {
    expect(parseRupiahInput('25000')).toBe(25000);
    expect(parseRupiahInput('Rp 25.000')).toBe(25000);
  });

  it('returns null for empty or unsafe values', () => {
    expect(parseRupiahInput('')).toBeNull();
    expect(parseRupiahInput('999999999999999999999999')).toBeNull();
  });
});
