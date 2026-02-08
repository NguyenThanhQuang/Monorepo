import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './providers';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../components/layout/LoginPage';
import { CompanyDashboard } from '../features/dashboard/pages/CompanyDashboard';
import CompanyVehiclesPage from '../features/vehicles/pages/CompanyVehiclesPage';


function App() {
  // Hàm kiểm tra xem user đã đăng nhập chưa
  const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
  };

  // Protected Route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;