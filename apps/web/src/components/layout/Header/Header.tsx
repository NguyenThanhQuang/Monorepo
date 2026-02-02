import {
  Bus,
  User,
  Globe,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Ticket,
  UserCircle,
  Phone,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import type { HeaderProps } from '../../../hooks/Props/layout/HeaderProps';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useLanguage } from '../../../contexts/LanguageContext';

/* ================= AUTH UTILS ================= */
function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function checkAdmin(user: any) {
  return (
    user?.roles?.includes('admin') ||
    user?.roles?.includes('company_admin')
  );
}
/* ============================================== */

export function Header({
  isLoggedIn = false,
  isAdmin = false,
  onLoginClick,
  onMyTripsClick,
  onProfileClick,
  onLogout,
  onRoutesClick,
  onContactClick,
  onTicketLookupClick,
  onHotlineClick,
  onHomeClick,
  onAdminAccess,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = getCurrentUser();
  const isUserAdmin = checkAdmin(user);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-3"
          >
            <Bus className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Online Bus Ticket Platform
            </span>
          </button>

          {/* NAV */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={onHomeClick}>{t('home')}</button>
            <button onClick={onTicketLookupClick}>
              {t('ticketLookup')}
            </button>
            <button onClick={onContactClick}>{t('contact')}</button>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center space-x-3">

            <button
              onClick={onHotlineClick}
              className="hidden md:flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('hotline')}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>

            {/* ================= AUTH ================= */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border">
                    {/* USER INFO */}
                    <div className="p-4 border-b">
                      <div className="font-semibold">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="py-2">
                      <button
                        onClick={onMyTripsClick}
                        className="w-full px-4 py-3 flex items-center space-x-3"
                      >
                        <Ticket className="w-5 h-5" />
                        <span>{t('myTrips')}</span>
                      </button>

                      <button
                        onClick={onProfileClick}
                        className="w-full px-4 py-3 flex items-center space-x-3"
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>{t('profile')}</span>
                      </button>

                      {isUserAdmin && (
                        <button
                          onClick={onAdminAccess}
                          className="w-full px-4 py-3 flex items-center space-x-3 text-purple-600"
                        >
                          <Shield className="w-5 h-5" />
                          <span>Admin</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          onLogout?.();
                        }}
                        className="w-full px-4 py-3 flex items-center space-x-3 text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-2 rounded-xl"
              >
                {t('login')}
              </button>
            )}

            <button className="lg:hidden p-2">
              <Menu />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
