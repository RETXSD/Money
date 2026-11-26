import { SENIOR_HONORIFIC_AGE } from './constants.js';

/** @param {'female'|'male'} gender @param {number} age */
export function getHonorific(gender, age) {
  const isSenior = age >= SENIOR_HONORIFIC_AGE;
  if (gender === 'female') return isSenior ? 'Ibu' : 'Mbak';
  if (gender === 'male') return isSenior ? 'Bapak' : 'Mas';
  return '';
}
