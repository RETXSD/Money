import { describe, expect, it } from 'vitest';
import { calculateAge, formatLocalDate, isValidBirthDate } from './dates.js';

const today = new Date(2026, 10, 26);

describe('formatLocalDate', () => {
  it('formats the supplied local date without shifting timezones', () => {
    expect(formatLocalDate(new Date(2026, 0, 8, 23))).toBe('2026-01-08');
  });
});

describe('calculateAge', () => {
  it('does not count a birthday that has not arrived this year', () => {
    expect(calculateAge('2000-12-01', today)).toBe(25);
  });

  it('counts a birthday that has already passed this year', () => {
    expect(calculateAge('2000-05-10', today)).toBe(26);
  });

  it('returns null for impossible calendar dates', () => {
    expect(calculateAge('2001-02-29', today)).toBeNull();
  });
});

describe('isValidBirthDate', () => {
  it('rejects impossible dates and non-leap February 29', () => {
    expect(isValidBirthDate('2001-02-29', today)).toBe(false);
  });

  it('rejects dates before 1900 and dates in the future', () => {
    expect(isValidBirthDate('1899-12-31', today)).toBe(false);
    expect(isValidBirthDate('2026-11-27', today)).toBe(false);
  });

  it('enforces the minimum age and accepts the thirteenth birthday', () => {
    expect(isValidBirthDate('2013-11-27', today)).toBe(false);
    expect(isValidBirthDate('2013-11-26', today)).toBe(true);
  });

  it('accepts February 29 only when it is a real date', () => {
    expect(isValidBirthDate('2000-02-29', today)).toBe(true);
  });
});
