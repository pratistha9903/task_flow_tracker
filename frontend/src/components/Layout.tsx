import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  activeNav?: 'tasks' | 'analytics' | 'overview';
  onNavChange?: (nav: 'tasks' | 'analytics') => void;
  showAdminNav?: boolean;
}

export default function Layout({
  children,
  title,
  subtitle,
  activeNav,
  onNavChange,
  showAdminNav,
}: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <div>
            <span className="brand-name">TaskFlow</span>
            <span className="brand-tagline">Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {showAdminNav ? (
            <>
              <button
                type="button"
                className={`nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
                onClick={() => onNavChange?.('analytics')}
              >
                <span className="nav-icon">◈</span>
                Analytics
              </button>
              <button
                type="button"
                className={`nav-item ${activeNav === 'tasks' ? 'active' : ''}`}
                onClick={() => onNavChange?.('tasks')}
              >
                <span className="nav-icon">☰</span>
                All Tasks
              </button>
            </>
          ) : (
            <div className="nav-item active">
              <span className="nav-icon">☰</span>
              My Tasks
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className={`role-pill role-${user?.role.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
