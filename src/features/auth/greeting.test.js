import { describe, expect, it } from 'vitest';
import { getGreeting, getHonorific } from './greeting.js';

const profile = {
  displayName: 'Sinta Dewi',
  gender: 'female',
  birthDate: '2000-05-10',
};

describe('getGreeting', () => {
  it.each([
    [3, 'Selamat malam'],
    [4, 'Selamat pagi'],
    [10, 'Selamat pagi'],
    [11, 'Selamat siang'],
    [14, 'Selamat siang'],
    [15, 'Selamat sore'],
    [17, 'Selamat sore'],
    [18, 'Selamat malam'],
  ])('uses the greeting for hour %i', (hour, greeting) => {
    const now = new Date(2026, 10, 26, hour);
    expect(getGreeting(profile, now)).toBe(`${greeting}, Mbak Sinta`);
  });

  it('uses the male honorific and only the first name', () => {
    expect(getGreeting({ ...profile, gender: 'male' }, new Date(2026, 10, 26, 8))).toBe(
      'Selamat pagi, Mas Sinta',
    );
  });
});

describe('getHonorific', () => {
  it.each([
    ['female', 44, 'Mbak'],
    ['female', 45, 'Ibu'],
    ['male', 44, 'Mas'],
    ['male', 45, 'Bapak'],
  ])('maps %s age %i to %s', (gender, age, honorific) => {
    expect(getHonorific(gender, age)).toBe(honorific);
  });
});
