// src/components/layout/CompanyLayout.tsx
import {  useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useAuth } from '../../../../../admin/src/contexts/AuthContext';
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
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: '/company/vehicles',
      name: 'Quản lý xe',
      icon: <Bus className="w-5 h-5" />,
    },
    {
      path: '/company/trips',
      name: 'Quản lý chuyến đi',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      path: '/company/drivers',
      name: 'Quản lý tài xế',
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: '/company/settings',
      name: 'Cài đặt',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/5
          transition-all duration-300 ease-in-out z-50
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
            {sidebarOpen ? (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                OBTP
              </span>
            ) : (
              <span className="text-xl font-bold text-blue-600">O</span>
            )}
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
          </button>
          
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <span className={`${isActive(item.path) ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 mb-2
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
            {sidebarOpen && (
              <span className="ml-3 font-medium">
                {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`
              w-full mt-3 flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-3">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 min-h-screen
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          ml-0
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-30 flex items-center px-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="ml-4 text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            OBTP
          </div>
          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="pt-16 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}