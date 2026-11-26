import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from './hooks/useProfile.js';
import { resolveAuthRoute } from './routeGuard.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';

export function RouteGuard({ children, allowedRoutes }) {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile(user?.uid);
  const route = resolveAuthRoute({
    authLoading,
    user,
    profileLoading,
    profile,
    today: new Date(),
  });

  if (authError || profileError) {
    return (
      <main className="mx-auto grid min-h-screen w-[min(100%-32px,600px)] place-items-center">
        <SketchCard role="alert">
          <p className="mt-0">{authError || profileError}</p>
          <SketchButton onClick={() => window.location.reload()} variant="secondary">
            Coba muat ulang
          </SketchButton>
        </SketchCard>
      </main>
    );
  }

  if (route === 'loading') {
    return (
      <main className="grid min-h-screen place-items-center" role="status">
        Memuat dompetmu…
      </main>
    );
  }

  if (allowedRoutes.includes(route)) return children;
  if (route === 'login') return <Navigate replace to="/login" />;
  if (route === 'onboarding') return <Navigate replace to="/onboarding" />;
  return <Navigate replace to="/" />;
}
