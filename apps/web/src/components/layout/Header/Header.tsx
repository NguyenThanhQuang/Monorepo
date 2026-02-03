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
  Building2,
  BusFront,
} from 'lucide-react';
import { useState } from 'react';
import type { HeaderProps } from '../../../hooks/Props/layout/HeaderProps';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useLanguage } from '../../../contexts/LanguageContext';

/* ================= SAFE PARSE USER ================= */
type SafeUser = {
  name: string;
  email: string;
  roles: string[];
};

function getSafeUser(): SafeUser | null {
  const raw = localStorage.getItem('user');
  if (!raw || raw === 'undefined') return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function Header({
  isLoggedIn = false,
  onLoginClick,
  onMyTripsClick,
  onProfileClick,
  onLogout,
  onContactClick,
  onTicketLookupClick,
  onHotlineClick,
  onHomeClick,

  /* ADMIN */
  onAdminAccess,

  /* COMPANY */
  onCompanyDashboard,
  onCompanyTrips,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = isLoggedIn ? getSafeUser() : null;

  const isUser = user?.roles?.includes('user');
  const isCompanyAdmin = user?.roles?.includes('company_admin');
  const isAdmin =
    user?.roles?.includes('admin') ||
    user?.roles?.includes('system-admin') ||
    user?.roles?.includes('ADMIN');

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b">
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
                  onClick={() => setShowUserMenu(p => !p)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
                    {/* USER INFO */}
                    <div className="p-4 border-b bg-gradient-to-r from-blue-600/10 to-teal-500/10">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>

                    <div className="py-2">
                      {/* USER */}
                      {isUser && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onMyTripsClick?.();
                          }}
                          className="menu-item"
                        >
                          <Ticket className="w-5 h-5" />
                          <span>{t('myTrips')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onProfileClick?.();
                        }}
                        className="menu-item"
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>{t('profile')}</span>
                      </button>

                      {/* COMPANY ADMIN */}
                      {isCompanyAdmin && (
                        <>
                          <div className="divider" />

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onCompanyDashboard?.();
                            }}
                            className="menu-item text-blue-600"
                          >
                            <Building2 className="w-5 h-5" />
                            <span>Quản lý nhà xe</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onCompanyTrips?.();
                            }}
                            className="menu-item text-blue-600"
                          >
                            <BusFront className="w-5 h-5" />
                            <span>Quản lý chuyến xe</span>
                          </button>
                        </>
                      )}

                      {/* SYSTEM ADMIN */}
                      {isAdmin && (
                        <>
                          <div className="divider" />
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onAdminAccess?.();
                            }}
                            className="menu-item text-purple-600"
                          >
                            <Shield className="w-5 h-5" />
                            <span>System Admin</span>
                          </button>
                        </>
                      )}

                      <div className="divider" />

                      {/* LOGOUT */}
                      <button
                        onClick={() => {
                          localStorage.clear();
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="menu-item text-red-600"
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

      {/* ======= MENU ITEM STYLE ======= */}
      <style>
        {`
          .menu-item {
            width: 100%;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
            transition: background 0.2s;
          }
          .menu-item:hover {
            background: rgba(59,130,246,0.08);
          }
          .divider {
            height: 1px;
            background: rgba(0,0,0,0.08);
            margin: 8px 0;
          }
        `}
      </style>
    </header>
  );
}
