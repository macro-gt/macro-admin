import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const nav = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/clientes', icon: '◉', label: 'Clientes' },
  { to: '/pagos', icon: '◆', label: 'Pagos' },
];

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">M</span>
          <div>
            <div className="logo-name">MACRO</div>
            <div className="logo-sub">Panel Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{usuario?.nombre?.[0] || 'A'}</div>
            <div>
              <div className="user-name">{usuario?.nombre}</div>
              <div className="user-role">{usuario?.rol}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
