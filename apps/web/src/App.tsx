import { useEffect, useState } from 'react';
import { FAQPage } from './components/layout/faq/FAQPage';
import { ContactPage } from './components/layout/contact/ContactPage';
import { AdminLoginContainer } from './hooks/Logic/AdminLogin.container';
import { BookingManagement } from './pages/admin/BookingManagement';
import { CompanyManagement } from './pages/admin/CompanyManagement';
import { SystemDashboardContainer } from './hooks/Logic/SystemDashboard.container';
import { UserManagementContainer } from './hooks/Logic/UserManagement.container';
import { HeroSearch } from './components/shared/Search/HeroSearch';
import { Features } from './components/layout/Features';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';
import { Auth } from './pages/auth/auth';
import { UserProfilePage } from './pages/UserProfile';
import { SearchResults } from './components/shared/Search/SearchResults.ui';

/* ================= PLACEHOLDER PAGES ================= */
const TicketLookupPage = () => <div className="p-6">Tra Cứu Vé</div>;
const MyTripsPage = () => <div className="p-6">Chuyến Đi Của Tôi</div>;

/* ================= PAGE TYPE ================= */
export type Page =
  | 'home'
  | 'search-results'
  | 'faq'
  | 'contact'
  | 'ticketLookup'
  | 'profile'
  | 'myTrips'
  | 'admin-login'
  | 'booking-management'
  | 'company-management'
  | 'system-dashboard'
  | 'user-management';

/* ================= SAFE JSON PARSE ================= */
function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const App = () => {
  const [page, setPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminType, setAdminType] =
    useState<'company' | 'system'>('system');
  const [adminUser, setAdminUser] = useState<any>(null);

  /* ================= SEARCH STATE ================= */
  const [searchParams, setSearchParams] = useState<{
    fromId: string;
    toId: string;
    date?: string;
  } | null>(null);

  /* ================= CHECK LOGIN ON LOAD ================= */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminToken = localStorage.getItem('adminToken');

    const user = safeParse<any>(localStorage.getItem('user'));
    const adminUserData = safeParse<any>(
      localStorage.getItem('adminUser'),
    );

    if (adminToken && adminUserData) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setAdminUser(adminUserData);

      setPage(
        adminUserData.roles?.includes('system-admin')
          ? 'system-dashboard'
          : 'company-management',
      );
      return;
    }

    if (token && user) {
      setIsLoggedIn(true);

      if (user.roles?.some((r: string) => r.includes('admin'))) {
        setIsAdmin(true);
        setAdminUser(user);

        setPage(
          user.roles.includes('system-admin') ||
            user.roles.includes('ADMIN')
            ? 'system-dashboard'
            : 'company-management',
        );
      }
    }
  }, []);

  /* ================= AUTH ================= */
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setAdminUser(null);
    setPage('home');
  };

  /* ================= ADMIN ================= */
  const handleAdminLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    setIsAdmin(true);
    setAdminUser(userData);
    setPage(
      adminType === 'system'
        ? 'system-dashboard'
        : 'company-management',
    );
  };

  const handleAdminLoginClick = (
    type: 'company' | 'system',
  ) => {
    setAdminType(type);
    setPage('admin-login');
  };

  const handleAdminAccess = () => {
    if (!isAdmin) {
      handleAdminLoginClick('system');
      return;
    }

    setPage(
      adminUser?.roles?.includes('system-admin') ||
        adminUser?.roles?.includes('ADMIN')
        ? 'system-dashboard'
        : 'company-management',
    );
  };

  /* ================= RENDER PAGE ================= */
  const renderPage = () => {
    switch (page) {
      case 'search-results':
        if (!searchParams) return null;
        return (
          <SearchResults
            fromId={searchParams.fromId}
            toId={searchParams.toId}
            date={searchParams.date}
            onBack={() => setPage('home')}
            onTripSelect={(tripId) =>
              console.log('Trip selected:', tripId)
            }
          />
        );

      case 'ticketLookup':
        return <TicketLookupPage />;

      case 'profile':
        return (
          <UserProfilePage onBack={() => setPage('home')} />
        );

      case 'myTrips':
        return <MyTripsPage />;

      case 'faq':
        return <FAQPage onBack={() => setPage('home')} />;

      case 'contact':
        return (
          <ContactPage
            onBack={() => setPage('home')}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuth(true)}
            onLogout={handleLogout}
            onMyTripsClick={() => setPage('myTrips')}
            onProfileClick={() => setPage('profile')}
            onRoutesClick={() => {}}
            onTicketLookupClick={() =>
              setPage('ticketLookup')
            }
            onHotlineClick={() => console.log('Hotline')}
          />
        );

      case 'admin-login':
        return (
          <AdminLoginContainer
            adminType={adminType}
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={() => setPage('home')}
          />
        );

      case 'booking-management':
        return <BookingManagement />;

      case 'company-management':
        return <CompanyManagement />;

      case 'system-dashboard':
        return <SystemDashboardContainer />;

      case 'user-management':
        return <UserManagementContainer />;

      case 'home':
      default:
        return (
          <>
            <HeroSearch
              onSearch={(params:any) => {
                setSearchParams(params);
                setPage('search-results');
              }}
            />
            <Features />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        onHomeClick={() => setPage('home')}
        onRoutesClick={() => setPage('home')}
        onTicketLookupClick={() =>
          setPage('ticketLookup')
        }
        onContactClick={() => setPage('contact')}
        onHotlineClick={() => console.log('Hotline')}
        onMyTripsClick={() => setPage('myTrips')}
        onProfileClick={() => setPage('profile')}
        onAdminAccess={isAdmin ? handleAdminAccess : undefined}
      />

      <main className="flex-1">{renderPage()}</main>

      <Footer
        onNavigate={(p) => {
          if (p === 'faq') setPage('faq');
          if (p === 'contact-us') setPage('contact');
        }}
      />

      {showAuth && (
        <Auth
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default App;
