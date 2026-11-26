import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { PlaceholderPage } from '../shared/components/PlaceholderPage.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { DesignPage } from '../features/design/DesignPage.jsx';

const appRoutes = [
  { index: true, element: <PlaceholderPage page="Beranda" /> },
  { path: 'onboarding', element: <PlaceholderPage page="Kenali dompetmu" /> },
  { path: 'transactions', element: <PlaceholderPage page="Transaksi" /> },
  { path: 'budgets', element: <PlaceholderPage page="Anggaran" /> },
  { path: 'debts', element: <PlaceholderPage page="Utang & piutang" /> },
  { path: 'debts/:id', element: <PlaceholderPage page="Detail utang" /> },
  { path: 'profile', element: <PlaceholderPage page="Profil" /> },
  { path: 'settings/*', element: <PlaceholderPage page="Pengaturan" /> },
];

if (import.meta.env.DEV) {
  appRoutes.push({ path: 'design', element: <DesignPage /> });
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <App />, children: appRoutes },
  { path: '*', element: <PlaceholderPage page="Halaman tidak ditemukan" /> },
]);
