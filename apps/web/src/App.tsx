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
      
      // Nếu đã login admin nhưng chưa ở trang admin, tự động chuyển
      if (!page.includes('admin') && !page.includes('dashboard') && !page.includes('management')) {
        if (adminUserData.roles?.includes('system-admin')) {
          setPage('system-dashboard');
        } else if (adminUserData.roles?.includes('company-admin')) {
          setPage('company-management');
        }
      }
    } else if (token) {
      setIsLoggedIn(true);
      const userRoles = user?.roles || [];
      if (userRoles.some((role: string) => role.includes('admin'))) {
        setIsAdmin(true);
        setAdminUser(user);
      }
    }
  }, [page]);

  /* ================= HANDLERS ================= */
  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleLoginSuccess = (userData?: any) => {
    const user = userData || JSON.parse(localStorage.getItem('user') || '{}');
    setIsLoggedIn(true);
    
    const userRoles = user?.roles || [];
    if (userRoles.some((role: string) => role.includes('admin'))) {
      setIsAdmin(true);
      setAdminUser(user);
      
      // Tự động chuyển đến dashboard admin
      if (userRoles.includes('system-admin') || userRoles.includes('ADMIN')) {
        setPage('system-dashboard');
        setAdminType('system');
      } else if (userRoles.includes('company-admin') || userRoles.includes('COMPANY_ADMIN')) {
        setPage('company-management');
        setAdminType('company');
      }
    }
    
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setAdminUser(null);
    setPage('home');
  };

  /* ================= ADMIN HANDLERS ================= */
  const handleAdminLoginSuccess = (userData: any) => {
    setIsAdmin(true);
    setIsLoggedIn(true);
    setAdminUser(userData);
    
    if (adminType === 'system') {
      setPage('system-dashboard');
    } else {
      setPage('company-management');
    }
  };

  const handleAdminLoginClick = (type: 'company' | 'system') => {
    setAdminType(type);
    setPage('admin-login');
  };

  /* ================= RENDER PAGE ================= */
  const renderPage = () => {
    switch (page) {
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
        // Chỉ cho phép company admin truy cập
        if (isAdmin && adminUser?.roles?.some((r: string) => 
          r.includes('company-admin') || r.includes('COMPANY_ADMIN')
        )) {
          return <BookingManagement />;
        }
        return <div className="p-6">Bạn không có quyền truy cập</div>;
        
      case 'company-management':
        // Chỉ cho phép system admin truy cập
        if (isAdmin && adminUser?.roles?.some((r: string) => 
          r.includes('system-admin') || r.includes('ADMIN')
        )) {
          return <CompanyManagement />;
        }
        return <div className="p-6">Bạn không có quyền truy cập</div>;
        
      case 'system-dashboard':
        // Chỉ cho phép system admin truy cập
        if (isAdmin && adminUser?.roles?.some((r: string) => 
          r.includes('system-admin') || r.includes('ADMIN')
        )) {
          return <SystemDashboardContainer />;
        }
        return <div className="p-6">Bạn không có quyền truy cập</div>;
        
      case 'user-management':
        // Chỉ cho phép system admin truy cập
        if (isAdmin && adminUser?.roles?.some((r: string) => 
          r.includes('system-admin') || r.includes('ADMIN')
        )) {
          return <UserManagementContainer />;
        }
        return <div className="p-6">Bạn không có quyền truy cập</div>;
        
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

  /* ================= ADMIN ACCESS LOGIC ================= */
  const handleAdminAccess = () => {
    if (isAdmin) {
      // Nếu đã là admin, chuyển đến dashboard phù hợp
      if (adminUser?.roles?.some((r: string) => 
        r.includes('system-admin') || r.includes('ADMIN')
      )) {
        setPage('system-dashboard');
      } else if (adminUser?.roles?.some((r: string) => 
        r.includes('company-admin') || r.includes('COMPANY_ADMIN')
      )) {
        setPage('company-management');
      }
    } else {
      // Nếu chưa là admin, chuyển đến trang chọn loại admin
      handleAdminLoginClick('system'); // Mặc định system admin
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
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

      {/* Admin access button - chỉ hiển thị cho development */}
      {import.meta.env.NODE_ENV === 'development' && !isAdmin && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={handleAdminAccess}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
          >
            Admin Access (Dev)
          </button>
        </div>
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer
        onNavigate={(page) => {
          if (page === 'faq') setPage('faq');
          if (page === 'contact-us') setPage('contact');
          if (page === 'terms') console.log('Navigate to terms');
          if (page === 'privacy') console.log('Navigate to privacy');
          if (page === 'about-us') console.log('Navigate to about us');
        }}
      />

      {/* ================= USER AUTH MODAL ================= */}
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