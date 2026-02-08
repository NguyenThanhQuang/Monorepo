import { useState } from 'react';
import {
  forgotPasswordApi,
  loginApi,
  registerApi,
} from '../../api/service/auth/auth.api';

export function useAuthLogic({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: any) => void;
}) {
  const [mode, setMode] = useState<
    'login' | 'register' | 'forgot-password'
  >('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // ===== LOGIN =====
      if (mode === 'login') {
     const res = await loginApi({
  identifier: email,
  password,
});

const loginData = res.data?.data;

if (!loginData) {
  throw new Error('Login response is empty');
}

const { accessToken, user } = loginData;

localStorage.setItem('access_token', accessToken);
localStorage.setItem('user', JSON.stringify(user));

onLoginSuccess(user);

        return;
      }

      // ===== REGISTER =====
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          return;
        }

        await registerApi({
          email,
          password,
          name: fullName,
          phone,
        });

        setMode('login');
        return;
      }

      // ===== FORGOT PASSWORD =====
      if (mode === 'forgot-password') {
        await forgotPasswordApi({ email });
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,

    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    phone,
    setPhone,

    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    loading,
    error,

    handleSubmit,
  };
}
