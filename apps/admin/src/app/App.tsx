// src/app/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider } from "./providers";
import { AdminLayout } from "../components/layout/AdminLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import { AdminDashboard } from "../features/dashboard/pages/DashboardPage";
import { AdminRevenuePage } from "../features/bookings/pages/AdminRevenuePage";
import { CompanyManagement } from "../features/companies/pages/CompanyManagement";
import { UserManagement } from "../features/users/pages/UserManagement";
import { AdminReviewManagement } from "../features/review/page/AdminReviewManagement";
import ActivateAccountPage from "../features/ActivateAccountPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles?.includes("admin")) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Default route khi mở app */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/activate-account"
  element={<ActivateAccountPage />}
/>
        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute>
              <AdminRevenuePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute>
              <CompanyManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute>
              <AdminReviewManagement />
            </ProtectedRoute>
          }
        />

   
      </Routes>
    </Router>
  );
}
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;