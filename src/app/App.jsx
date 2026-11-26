import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DoodleIcon } from '../shared/components/DoodleIcon.jsx';
import { SketchButton } from '../shared/components/SketchButton.jsx';

const navigation = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/transactions', label: 'Catatan', icon: 'receipt' },
  { to: '/budgets', label: 'Budget', icon: 'chart' },
  { to: '/debts', label: 'Teman', icon: 'people' },
];

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesign = location.pathname === '/design';

  if (isDesign) return <Outlet />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink aria-label="MTRCK beranda" className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>MTRCK</span>
        </NavLink>
        <div className="header-actions">
          <span className="header-caption">dompet lebih tenang</span>
          <NavLink aria-label="Buka profil" className="avatar-link" to="/profile">
            A
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
            className={({ isActive }) => `nav-item${isActive ? 'nav-item-active' : ''}`}
            end={item.end}
            to={item.to}
          >
            <DoodleIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <SketchButton
          aria-label="Buka pengaturan"
          className="nav-settings"
          onClick={() => navigate('/settings')}
          variant="secondary"
        >
          <DoodleIcon name="settings" />
        </SketchButton>
      </nav>
    </div>
  );
}
