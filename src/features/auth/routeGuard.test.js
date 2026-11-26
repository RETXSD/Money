import { describe, expect, it } from 'vitest';
import { resolveAuthRoute } from './routeGuard.js';

const today = new Date(2026, 10, 26);
const user = { uid: 'user-1' };
const profile = {
  displayName: 'Sinta',
  gender: 'female',
  birthDate: '2000-05-10',
};

describe('resolveAuthRoute', () => {
  it('waits while auth or profile is loading', () => {
    expect(resolveAuthRoute({ authLoading: true, user: null, today })).toBe('loading');
    expect(resolveAuthRoute({ authLoading: false, user, profileLoading: true, today })).toBe(
      'loading',
    );
  });

  it('sends signed-out users to login', () => {
    expect(resolveAuthRoute({ authLoading: false, user: null, today })).toBe('login');
  });

  it('requires onboarding for a missing or invalid profile', () => {
    expect(resolveAuthRoute({ authLoading: false, user, profileLoading: false, today })).toBe(
      'onboarding',
    );
    expect(
      resolveAuthRoute({
        authLoading: false,
        user,
        profileLoading: false,
        profile: { ...profile, gender: '' },
        today,
      }),
    ).toBe('onboarding');
  });

  it('allows a user with a complete profile into the app', () => {
    expect(
      resolveAuthRoute({ authLoading: false, user, profileLoading: false, profile, today }),
    ).toBe('app');
  });
});
