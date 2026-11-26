import { calculateAge } from '../../shared/utils/dates.js';
import { getHonorific } from '../../shared/domain/honorific.js';

export { getHonorific } from '../../shared/domain/honorific.js';

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
