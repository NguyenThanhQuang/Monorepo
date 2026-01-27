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

/* ================= PLACEHOLDER PAGES ================= */
const RoutesPage = () => <div className="p-6">Trang Tuyến Xe</div>;
const TicketLookupPage = () => <div className="p-6">Tra Cứu Vé</div>;
const ProfilePage = () => <div className="p-6">Hồ Sơ Cá Nhân</div>;
const MyTripsPage = () => <div className="p-6">Chuyến Đi Của Tôi</div>;

export type Page =
  | 'home'
  | 'routes'
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

const App = () => {
  const [page, setPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminType, setAdminType] = useState<'company' | 'system'>('system');
  const [adminUser, setAdminUser] = useState<any>(null);

  /* ================= CHECK LOGIN ON LOAD ================= */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = JSON.parse(localStorage.getItem('adminUser') || '{}');

    if (adminToken) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setAdminUser(adminUserData);

      if (adminUserData.roles?.includes('system-admin')) {
        setPage('system-dashboard');
      } else if (adminUserData.roles?.includes('company-admin')) {
        setPage('company-management');
      }
    } else if (token) {
      setIsLoggedIn(true);
      if (user?.roles?.some((r: string) => r.includes('admin'))) {
        setIsAdmin(true);
        setAdminUser(user);
      }
    }
  }, []);

  /* ================= AUTH ================= */
  const handleLoginSuccess = (userData?: any) => {
    const user = userData || JSON.parse(localStorage.getItem('user') || '{}');
    setIsLoggedIn(true);
    setShowAuth(false);

    if (user?.roles?.some((r: string) => r.includes('admin'))) {
      setIsAdmin(true);
      setAdminUser(user);

      if (user.roles.includes('system-admin') || user.roles.includes('ADMIN')) {
        setPage('system-dashboard');
        setAdminType('system');
      } else {
        setPage('company-management');
        setAdminType('company');
      }
    }
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
    setPage(adminType === 'system' ? 'system-dashboard' : 'company-management');
  };

  const handleAdminLoginClick = (type: 'company' | 'system') => {
    setAdminType(type);
    setPage('admin-login');
  };

  const handleAdminAccess = () => {
    if (!isAdmin) {
      handleAdminLoginClick('system');
      return;
    }

    if (adminUser?.roles?.includes('system-admin') || adminUser?.roles?.includes('ADMIN')) {
      setPage('system-dashboard');
    } else {
      setPage('company-management');
    }
  };

  /* ================= RENDER PAGE ================= */
  const renderPage = () => {
    switch (page) {
      case 'routes':
        return <RoutesPage />;

      case 'ticketLookup':
        return <TicketLookupPage />;

      case 'profile':
        return <ProfilePage />;

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
            onRoutesClick={() => setPage('routes')}
            onTicketLookupClick={() => setPage('ticketLookup')}
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
            <HeroSearch />
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
        onRoutesClick={() => setPage('routes')}
        onTicketLookupClick={() => setPage('ticketLookup')}
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
          onLoginSuccess={() => handleLoginSuccess()}
        />
      )}
    </div>
  );
};

export default App;
