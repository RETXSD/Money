import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { PlaceholderPage } from '../shared/components/PlaceholderPage.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { OnboardingPage } from '../features/auth/OnboardingPage.jsx';
import { ProfilePage } from '../features/auth/ProfilePage.jsx';
import { RouteGuard } from '../features/auth/RouteGuard.jsx';
import { DesignPage } from '../features/design/DesignPage.jsx';

const appRoutes = [
  { index: true, element: <PlaceholderPage page="Beranda" /> },
  { path: 'transactions', element: <PlaceholderPage page="Transaksi" /> },
  { path: 'budgets', element: <PlaceholderPage page="Anggaran" /> },
  { path: 'debts', element: <PlaceholderPage page="Utang & piutang" /> },
  { path: 'debts/:id', element: <PlaceholderPage page="Detail utang" /> },
  { path: 'profile', element: <ProfilePage /> },
  { path: 'settings/*', element: <PlaceholderPage page="Pengaturan" /> },
];

if (import.meta.env.DEV) {
  appRoutes.push({ path: 'design', element: <DesignPage /> });
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RouteGuard allowedRoutes={['login']}>
        <LoginPage />
      </RouteGuard>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <RouteGuard allowedRoutes={['onboarding']}>
        <OnboardingPage />
      </RouteGuard>
    ),
  },
  {
    path: '/',
    element: (
      <RouteGuard allowedRoutes={['app']}>
        <App />
      </RouteGuard>
    ),
    children: appRoutes,
  },
  ...(import.meta.env.DEV ? [{ path: '/design', element: <DesignPage /> }] : []),
  { path: '*', element: <PlaceholderPage page="Halaman tidak ditemukan" /> },
]);
