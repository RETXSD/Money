import { describe, expect, it } from 'vitest';
import { normalizeIndonesianPhone } from './phone.js';

describe('normalizeIndonesianPhone', () => {
  it.each([
    ['081234567890', '6281234567890'],
    ['+62 812-3456-7890', '6281234567890'],
    ['81234567890', '6281234567890'],
    ['', ''],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeIndonesianPhone(input)).toBe(expected);
  });
});
