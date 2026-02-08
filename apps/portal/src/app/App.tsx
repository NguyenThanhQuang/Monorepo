import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/layout/LoginPage';
import { CompanyDashboard } from '../features/dashboard/pages/CompanyDashboard';
import CompanyVehiclesPage from '../features/vehicles/pages/CompanyVehiclesPage';
import { ThemeProvider } from './providers';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra role nếu cần
  if (!user.roles?.includes('company_admin')) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
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
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;