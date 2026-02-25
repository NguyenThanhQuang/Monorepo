// src/components/layout/AdminLayout.tsx
import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Users,
  Bus,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Shield,
  Ticket,
  DollarSign,
  Globe // Thêm icon Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext'; // Import useLanguage

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage(); // Sử dụng useLanguage
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: t('dashboard'), // Sử dụng translation
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: '/admin/revenue',
      name: t('revenue'), // Sử dụng translation
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      path: '/admin/companies',
      name: t('companyManagement'), // Sử dụng translation
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      path: '/admin/users',
      name: t('userManagement'), // Sử dụng translation
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: '/admin/vehicles',
      name: t('vehicleManagement'), // Sử dụng translation
      icon: <Bus className="w-5 h-5" />,
    },
    {
      path: '/admin/trips',
      name: t('tripManagement'), // Sử dụng translation
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      path: '/admin/bookings',
      name: t('bookingManagement'), // Sử dụng translation
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      path: '/admin/finance',
      name: t('finance'), // Sử dụng translation
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      path: '/admin/settings',
      name: t('settings'), // Sử dụng translation
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center mr-2">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {t('adminPanel')}
              </span>
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
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
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
          {/* Language Toggle - Thêm nút chuyển ngôn ngữ */}
          <button
            onClick={toggleLanguage}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 mb-2
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            {sidebarOpen && (
              <span className="ml-3 font-medium">
                {language === 'vi' ? 'English' : 'Tiếng Việt'}
              </span>
            )}
          </button>

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
                {theme === 'light' ? t('darkTheme') : t('lightTheme')}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg shadow-purple-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || t('admin')}
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
            {sidebarOpen && <span className="ml-3">{t('logout')}</span>}
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
          <div className="ml-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t('adminPanel')}
          </div>
          
          {/* Mobile Language & Theme Toggles */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}