// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyDashboard } from '../../features/dashboard/pages/CompanyDashboard';
import { AdminLogin } from '../auth/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  const handleLoginSuccess = (data: any) => {
    setIsLoggedIn(true);
    setAdminData(data);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoggedIn && adminData) {
    return <CompanyDashboard />;
  }

  return (
    <AdminLogin
      onLoginSuccess={handleLoginSuccess}
      onBack={handleBackToHome}
    />
  );
}