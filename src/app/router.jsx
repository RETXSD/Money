import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { PlaceholderPage } from '../shared/components/PlaceholderPage.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { OnboardingPage } from '../features/auth/OnboardingPage.jsx';
import { ProfilePage } from '../features/auth/ProfilePage.jsx';
import { RouteGuard } from '../features/auth/RouteGuard.jsx';
import { CategoriesPage } from '../features/categories/CategoriesPage.jsx';
import { SettingsPage } from '../features/categories/SettingsPage.jsx';
import { TransactionsPage } from '../features/transactions/TransactionsPage.jsx';
import { DesignPage } from '../features/design/DesignPage.jsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { BudgetPage } from '../features/budgets/BudgetPage.jsx';
import { DebtsPage } from '../features/debts/DebtsPage.jsx';
import { DebtDetailPage } from '../features/debts/DebtDetailPage.jsx';

const appRoutes = [
  { index: true, element: <DashboardPage /> },
  { path: 'transactions', element: <TransactionsPage /> },
  { path: 'budgets', element: <BudgetPage /> },
  { path: 'debts', element: <DebtsPage /> },
  { path: 'debts/:id', element: <DebtDetailPage /> },
  { path: 'profile', element: <ProfilePage /> },
  { path: 'settings/categories', element: <CategoriesPage /> },
  { path: 'settings/*', element: <SettingsPage /> },
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
