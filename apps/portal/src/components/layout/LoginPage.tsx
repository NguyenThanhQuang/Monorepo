// src/pages/LoginPage.tsx
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '../auth/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <AdminLogin onBack={handleBackToHome} />
  );
}