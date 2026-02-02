import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { forgotPasswordApi, loginApi, registerApi } from '../../api/service/auth/auth.api';
// import {
//   forgotPasswordApi,
//   loginApi,
//   registerApi,
// } from '../../api/service/auth/auth.api';
export type AuthMode = 'login' | 'register' | 'forgot-password';

interface UseAuthLogicProps {
  onLoginSuccess: () => void;
}

export function useAuthLogic({ onLoginSuccess }: UseAuthLogicProps) {
  const { t } = useLanguage();

  /* ================= STATE ================= */
  const [mode, setMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      if (mode === 'login') {
        const res = await loginApi({
          identifier: email,
          password,
        });

        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));

        onLoginSuccess();
        return;
      }

      if (mode === 'register') {
        if (password !== confirmPassword) {
          alert(t('passwordNotMatch'));
          return;
        }

        await registerApi({
          email,
          password,
          name: fullName,
          phone,
        });

        alert(t('registerSuccess'));
        setMode('login');
        return;
      }

      if (mode === 'forgot-password') {
        await forgotPasswordApi({ email });

        alert(t('resetPasswordSuccess'));
        setMode('login');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra';

      alert(
        Array.isArray(message)
          ? message.map((m) => m.message).join('\n')
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    t,

    // state
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

    // handlers
    handleSubmit,
  };
}
