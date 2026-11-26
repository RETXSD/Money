import { describe, expect, it } from 'vitest';
import { isProfileComplete, validateProfile } from './profileValidation.js';

const today = new Date(2026, 10, 26);
const validProfile = {
  displayName: 'Sinta Dewi',
  gender: 'female',
  birthDate: '2000-05-10',
};

describe('validateProfile', () => {
  it('requires a trimmed name with no more than 50 characters', () => {
    expect(validateProfile({ ...validProfile, displayName: '  ' }, today).errors.displayName).toBe(
      'Nama wajib diisi.',
    );
    expect(
      validateProfile({ ...validProfile, displayName: 'a'.repeat(51) }, today).errors.displayName,
    ).toBe('Nama maksimal 50 karakter.');
  });

  it('requires one of the supported gender values', () => {
    expect(validateProfile({ ...validProfile, gender: '' }, today).errors.gender).toBe(
      'Pilih salah satu pilihan gender.',
    );
  });

  it('requires a valid date and the minimum age', () => {
    expect(
      validateProfile({ ...validProfile, birthDate: '2014-01-01' }, today).errors.birthDate,
    ).toBe('Usia minimum untuk menggunakan MTRCK adalah 13 tahun.');
    expect(validateProfile({ ...validProfile, birthDate: '2001-02-29' }, today).valid).toBe(false);
    expect(
      validateProfile({ ...validProfile, birthDate: '2026-11-27' }, today).errors.birthDate,
    ).toBe('Masukkan tanggal lahir yang valid.');
  });

  it('marks a valid profile complete', () => {
    expect(validateProfile(validProfile, today)).toEqual({ valid: true, errors: {} });
    expect(isProfileComplete(validProfile, today)).toBe(true);
  });
});
