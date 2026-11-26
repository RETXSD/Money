import { MIN_AGE } from '../constants/profile.js';

function parseBirthDate(birthDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || '');
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function getAge({ year, month, day }, today) {
  let age = today.getFullYear() - year;
  const birthdayNotReached =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);

  if (birthdayNotReached) age -= 1;
  return age;
}

export function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates whole years between a birth date and a supplied local date.
 * @param {string} birthDate Date in YYYY-MM-DD format.
 * @param {Date} today Local date used as the reference.
 * @returns {number|null} Age in whole years, or null for an invalid input.
 */
export function calculateAge(birthDate, today) {
  const parts = parseBirthDate(birthDate);
  if (!parts || !(today instanceof Date) || Number.isNaN(today.getTime())) return null;
  return getAge(parts, today);
}

/**
 * Checks that a birth date is real, in range, and old enough for the product.
 * @param {string} birthDate Date in YYYY-MM-DD format.
 * @param {Date} today Local date used as the reference.
 * @returns {boolean} Whether the date meets onboarding requirements.
 */
export function isValidBirthDate(birthDate, today) {
  const parts = parseBirthDate(birthDate);
  if (!parts || parts.year < 1900 || !(today instanceof Date)) return false;

  const birthDateIsFuture =
    parts.year > today.getFullYear() ||
    (parts.year === today.getFullYear() && parts.month > today.getMonth() + 1) ||
    (parts.year === today.getFullYear() &&
      parts.month === today.getMonth() + 1 &&
      parts.day > today.getDate());

  return !birthDateIsFuture && getAge(parts, today) >= MIN_AGE;
}
