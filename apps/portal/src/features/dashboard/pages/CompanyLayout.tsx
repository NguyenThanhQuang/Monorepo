import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../app/providers';

interface CompanyLayoutProps {
  children: ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      path: '/company/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/company/vehicles',
      name: 'Quản lý xe',
      icon: <Bus size={20} />,
    },
    {
      path: '/company/trips',
      name: 'Quản lý chuyến đi',
      icon: <Calendar size={20} />,
    },
    {
      path: '/company/drivers',
      name: 'Quản lý tài xế',
      icon: <Users size={20} />,
    },
    {
      path: '/company/settings',
      name: 'Cài đặt',
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="obtp-shell">
      {/* Mobile overlay */}
      {mobileSidebarOpen && <div className="obtp-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={[
          'obtp-sidebar',
          !sidebarOpen ? 'obtp-collapsed' : '',
          mobileSidebarOpen ? 'obtp-mobile-open' : '',
        ].join(' ')}
      >
        <div className="obtp-sidebar-header">
          <div className="obtp-brand">
            <span className="obtp-brand-gradient">OBTP</span>
          </div>

          {/* Desktop collapse */}
          <button
            className="obtp-icon-btn"
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
          </button>

          {/* Mobile close */}
          <button className="obtp-icon-btn obtp-close-btn" onClick={() => setMobileSidebarOpen(false)} style={{ marginLeft: 8 }}>
            <X size={18} />
          </button>
        </div>

        <nav className="obtp-nav">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileSidebarOpen(false);
                }}
                className={['obtp-nav-item', active ? 'obtp-active' : ''].join(' ')}
              >
                <span aria-hidden="true">{item.icon}</span>
                {sidebarOpen && <span className="obtp-nav-text">{item.name}</span>}
              </button>
            );
          })}

          <button
            onClick={toggleTheme}
            className="obtp-nav-item"
            style={{ marginTop: 6 }}
            title={theme === 'light' ? 'Chuyển sang tối' : 'Chuyển sang sáng'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {sidebarOpen && <span className="obtp-nav-text">{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>}
          </button>
        </nav>

        <div className="obtp-sidebar-bottom">
          <div className="obtp-user">
            <div className="obtp-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            {sidebarOpen && (
              <div className="obtp-user-meta">
                <div className="obtp-user-name">{user?.name || 'User'}</div>
                <div className="obtp-user-email">{user?.email || ''}</div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="obtp-danger-link" title="Đăng xuất">
            <LogOut size={18} />
            {sidebarOpen && <span style={{ fontWeight: 700 }}>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={['obtp-main', !sidebarOpen ? 'obtp-collapsed' : ''].join(' ')}>
        {/* Mobile topbar */}
        <div className="obtp-mobile-topbar">
          <button className="obtp-icon-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Mở menu">
            <Menu size={20} />
          </button>
          <div className="obtp-brand" style={{ marginLeft: 8 }}>
            <span className="obtp-brand-gradient">OBTP</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="obtp-icon-btn" onClick={toggleTheme} aria-label="Đổi theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className="obtp-content">{children}</div>
      </main>
    </div>
  );
}
