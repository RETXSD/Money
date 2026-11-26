import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './providers/useAuth.js';
import { useProfile } from '../features/auth/hooks/useProfile.js';
import { DoodleIcon } from '../shared/components/DoodleIcon.jsx';
import { NotificationsProvider } from '../features/notifications/components/NotificationsProvider.jsx';
import { APP_COPY } from '../shared/constants/copy.js';

const navigation = [
  { to: '/', label: APP_COPY.navigation.home, icon: 'home', end: true },
  { to: '/transactions', label: APP_COPY.navigation.transactions, icon: 'receipt' },
  { to: '/budgets', label: APP_COPY.navigation.budgets, icon: 'chart' },
  { to: '/debts', label: APP_COPY.navigation.debts, icon: 'people' },
  { to: '/settings', label: APP_COPY.navigation.settings, icon: 'settings' },
];

export function App() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.uid);

  return (
    <NotificationsProvider>
      <div className="app-shell">
        <header className="app-header">
          <NavLink aria-label="MTRCK beranda" className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              m
            </span>
            <span>MTRCK</span>
          </NavLink>
          <div className="header-actions">
            <NavLink aria-label="Buka profil" className="avatar-link" to="/profile">
              {profile?.photoURL ? (
                <img
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                  src={profile.photoURL}
                />
              ) : (
                profile?.displayName?.trim().charAt(0).toUpperCase() || 'A'
              )}
            </NavLink>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        <nav aria-label="Navigasi utama" className="bottom-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              aria-label={item.label}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
              end={item.end}
              to={item.to}
            >
              <DoodleIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </NotificationsProvider>
  );
}
