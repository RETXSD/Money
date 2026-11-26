import { SENIOR_HONORIFIC_AGE } from '../../shared/constants/profile.js';
import { calculateAge } from '../../shared/utils/dates.js';

export function getHonorific(gender, age) {
  const isSenior = age >= SENIOR_HONORIFIC_AGE;
  if (gender === 'female') return isSenior ? 'Ibu' : 'Mbak';
  if (gender === 'male') return isSenior ? 'Bapak' : 'Mas';
  return '';
}

export function getGreeting(profile, now) {
  if (!profile || !(now instanceof Date) || Number.isNaN(now.getTime())) return 'Halo, teman';

  const hour = now.getHours();
  const timeGreeting =
    hour >= 4 && hour <= 10
      ? 'Selamat pagi'
      : hour >= 11 && hour <= 14
        ? 'Selamat siang'
        : hour >= 15 && hour <= 17
          ? 'Selamat sore'
          : 'Selamat malam';
  const age = profile.age ?? calculateAge(profile.birthDate, now);
  const honorific = getHonorific(profile.gender, age ?? 0);
  const firstName = profile.displayName?.trim().split(/\s+/)[0];

  if (!firstName || !honorific) return `${timeGreeting}, teman`;
  return `${timeGreeting}, ${honorific} ${firstName}`;
}
