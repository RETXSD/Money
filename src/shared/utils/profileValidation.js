import { MIN_AGE } from '../constants/profile.js';
import { calculateAge, isValidBirthDate } from './dates.js';

export function getBirthDateError(birthDate, today) {
  if (!birthDate) return 'Tanggal lahir wajib diisi.';

  const age = calculateAge(birthDate, today);
  if (age === null || !isValidBirthDate(birthDate, today)) {
    if (age !== null && age >= 0 && age < MIN_AGE) {
      return `Usia minimum untuk menggunakan MTRCK adalah ${MIN_AGE} tahun.`;
    }
    return 'Masukkan tanggal lahir yang valid.';
  }

  return '';
}

export function validateProfile(profile, today) {
  const displayName = profile?.displayName?.trim() || '';
  const errors = {};

  if (!displayName) errors.displayName = 'Nama wajib diisi.';
  else if (displayName.length > 50) errors.displayName = 'Nama maksimal 50 karakter.';

  if (!['female', 'male'].includes(profile?.gender)) {
    errors.gender = 'Pilih salah satu pilihan gender.';
  }

  const birthDateError = getBirthDateError(profile?.birthDate, today);
  if (birthDateError) errors.birthDate = birthDateError;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function isProfileComplete(profile, today) {
  return Boolean(profile && validateProfile(profile, today).valid);
}
