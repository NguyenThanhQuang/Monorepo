// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import LoginPage from '../components/layout/LoginPage';
import { CompanyDashboard } from '../features/dashboard/pages/CompanyDashboard';
import CompanyVehiclesPage from '../features/vehicles/pages/CompanyVehiclesPage';
import { RouteManagement } from '../features/trips/pages/RouteManagement';
import { ThemeProvider } from './providers';
import AddTripContainer from '../features/trips/add-trip/AddTripContainer';
import { CompanyLayout } from '../features/dashboard/pages/CompanyLayout';

// Protected Route component with Layout
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles?.includes('company_admin')) {
    return <Navigate to="/login" replace />;
  }

  return <CompanyLayout>{children}</CompanyLayout>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/vehicles"
          element={
            <ProtectedRoute>
              <CompanyVehiclesPage />
            </ProtectedRoute>
          }
        />

        {/* Routes for Trip Management */}
        <Route
          path="/company/trips"
          element={
            <ProtectedRoute>
              <RouteManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/trips/add"
          element={
            <ProtectedRoute>
              <AddTripContainer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/trips/edit/:tripId"
          element={
            <ProtectedRoute>
              <AddTripContainer />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
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
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;