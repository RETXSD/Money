import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth.js';
import { useProfile } from './hooks/useProfile.js';
import { resolveAuthRoute } from './routeGuard.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { PageContainer, PageHeader } from '../../shared/components/Layout.jsx';

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
      <PageContainer className="guard-page">
        <PageHeader
          badge="MTRCK"
          description="Data dompet belum dapat dimuat."
          title="Koneksi terputus"
        />
        <SketchCard role="alert">
          <p>{authError || profileError}</p>
          <SketchButton onClick={() => window.location.reload()} variant="secondary">
            Coba muat ulang
          </SketchButton>
        </SketchCard>
      </PageContainer>
    );
  }

  if (route === 'loading') {
    return (
      <PageContainer className="guard-page" role="status">
        <PageHeader
          badge="MTRCK"
          description="Menyiapkan akun dan data uangmu."
          title="Memuat dompet"
        />
        Memuat dompetmu…
      </PageContainer>
    );
  }

  if (allowedRoutes.includes(route)) return children;
  if (route === 'login') return <Navigate replace to="/login" />;
  if (route === 'onboarding') return <Navigate replace to="/onboarding" />;
  return <Navigate replace to="/" />;
}
