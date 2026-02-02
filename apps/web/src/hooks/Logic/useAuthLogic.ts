import { useState } from 'react';
import {
  forgotPasswordApi,
  loginApi,
  registerApi,
} from '../../api/service/auth/auth.api';

/**
 * Custom hook xử lý logic Login / Register / Forgot password
 */
export function useAuthLogic({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
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

  /**
   * Submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // ================= LOGIN =================
      if (mode === 'login') {
        const res = await loginApi({
          identifier: email,
          password,
        });

        /**
         * ✅ LƯU TOKEN & USER
         * PHẢI dùng đúng key access_token
         */
        localStorage.setItem(
          'access_token',
          res.accessToken,
        );
        localStorage.setItem(
          'user',
          JSON.stringify(res.user),
        );

        onLoginSuccess();
        return;
      }

      // ================= REGISTER =================
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

        // Sau khi đăng ký → quay lại login
        setMode('login');
        return;
      }

      // ================= FORGOT PASSWORD =================
      if (mode === 'forgot-password') {
        await forgotPasswordApi({ email });
        return;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Có lỗi xảy ra, vui lòng thử lại';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // mode
    mode,
    setMode,

    // fields
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

    // ui state
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // status
    loading,
    error,

    // action
    handleSubmit,
  };
}
