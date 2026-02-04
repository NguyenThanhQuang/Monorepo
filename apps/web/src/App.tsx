import { useEffect, useState } from 'react';

import { FAQPage } from './components/layout/faq/FAQPage';
import { ContactPage } from './components/layout/contact/ContactPage';
import { Features } from './components/layout/Features';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';

import { HeroSearch } from './components/shared/Search/HeroSearch';
import { SearchResults } from './components/shared/Search/SearchResults.ui';

import { Auth } from './pages/auth/auth';
import { UserProfilePage } from './pages/UserProfile';

/* ===== ADMIN ===== */
import { AdminLoginContainer } from './hooks/Logic/AdminLogin.container';
import { SystemDashboardContainer } from './hooks/Logic/SystemDashboard.container';
import { UserManagementContainer } from './hooks/Logic/UserManagement.container';
import { CompanyDashboard } from './pages/company-dashboard';
import { BookingManagement } from './pages/admin/BookingManagement';
import { RouteManagement } from './pages/admin/route-management';
import VehicleManagementPage from './pages/admin/vehicle-management';
import AddTripContainer from './pages/company/add-trip/AddTripContainer';

/* ===== COMPANY DASHBOARD ===== */


/* ================= PLACEHOLDER ================= */
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
 | 'company-dashboard' 
  | 'add-trip'  // 👈 THÊM DÒNG NÀY
  | 'trips-management' 
  | 'vehicles-management'
  | 'trip-detail'
  | 'booking-management'
  /* SYSTEM */
  | 'system-dashboard'
  | 'user-management'

  /* COMPANY */
  | 'company-dashboard'
  | 'company-booking'
  | 'company-route'
  | 'company-vehicle';

/* ================= SAFE JSON ================= */
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

  /* ================= SEARCH ================= */
  const [searchParams, setSearchParams] = useState<{
    fromId: string;
    toId: string;
    date?: string;
  } | null>(null);

  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminToken = localStorage.getItem('adminToken');

    const user = safeParse<any>(localStorage.getItem('user'));
    const adminUserData = safeParse<any>(localStorage.getItem('adminUser'));

    if ((adminToken || token) && (adminUserData || user)) {
      const currentUser = adminUserData || user;

      setIsLoggedIn(true);
      setAdminUser(currentUser);

      const roles: string[] = currentUser.roles || [];

      if (roles.includes('system-admin')) {
        setIsAdmin(true);
        setAdminType('system');
        setPage('system-dashboard');
        return;
      }

      if (roles.includes('company-admin')) {
        setIsAdmin(true);
        setAdminType('company');
        setPage('company-dashboard');
        return;
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

    const roles: string[] = userData.roles || [];

    if (roles.includes('system-admin')) {
      setAdminType('system');
      setPage('system-dashboard');
    } else {
      setAdminType('company');
      setPage('company-dashboard');
    }
  };

  const handleAdminAccess = () => {
    if (!adminUser) return;

    const roles: string[] = adminUser.roles || [];

    if (roles.includes('system-admin')) {
      setPage('system-dashboard');
    } else if (roles.includes('company-admin')) {
      setPage('company-dashboard');
    }
  };

  /* ================= RENDER ================= */
  const renderPage = () => {
    switch (page) {
      case 'search-results':
        if (!searchParams) return null;
        return (
          <SearchResults
            {...searchParams}
            onBack={() => setPage('home')}
            onTripSelect={(id) => console.log(id)}
          />
        );

      case 'ticketLookup':
        return <TicketLookupPage />;

      case 'profile':
        return <UserProfilePage onBack={() => setPage('home')} />;

      case 'myTrips':
        return <MyTripsPage />;
    case 'add-trip': // 👈 THÊM CASE NÀY
      return <AddTripContainer />;
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
            onTicketLookupClick={() => setPage('ticketLookup')}
            onRoutesClick={() => {}}
            onHotlineClick={() => {}}
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

      /* ===== SYSTEM ===== */
      case 'system-dashboard':
        return <SystemDashboardContainer />;

      case 'user-management':
        return <UserManagementContainer />;

      /* ===== COMPANY ===== */
     case 'company-dashboard':
  return <CompanyDashboard onNavigate={setPage} />;


      case 'company-booking':
        return <BookingManagement />;

      case 'company-route':
        return <RouteManagement />;

      case 'company-vehicle':
        return <VehicleManagementPage />;

      case 'home':
      default:
        return (
          <>
            <HeroSearch
              onSearch={(params: any) => {
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
  onTicketLookupClick={() => setPage('ticketLookup')}
  onContactClick={() => setPage('contact')}
  onMyTripsClick={() => setPage('myTrips')}
  onProfileClick={() => setPage('profile')}

  /* 🔥 ADMIN */
  onAdminAccess={handleAdminAccess}

  /* 🔥 COMPANY */
  onCompanyDashboard={() => setPage('company-dashboard')}
  onCompanyTrips={() => setPage('company-booking')}
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
