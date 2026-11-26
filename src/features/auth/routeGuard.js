import { isProfileComplete } from '../../shared/utils/profileValidation.js';

export function resolveAuthRoute({ authLoading, user, profileLoading, profile, today }) {
  if (authLoading || (user && profileLoading)) return 'loading';
  if (!user) return 'login';
  if (!isProfileComplete(profile, today)) return 'onboarding';
  return 'app';
}
