import { useState } from 'react';
import { User, Lock, Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForgotPasswordModal } from './ForgotPassword';

interface AdminLoginProps {
  onLoginSuccess: (adminData: {
    name: string;
    id: string;
    email: string;
    companyId: string; // Thêm companyId
  }) => void;
  onBack: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setErrorMessage('');
      setIsLoading(true);

      const res = await authApi.login({
        identifier,
        password,
      });

      const { accessToken, user } = res.data.data;

      // ✅ check role company admin
      if (!user.roles?.includes('company_admin')) {
        setErrorMessage('Tài khoản không có quyền quản trị công ty.');
        return;
      }

      // ✅ lưu token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user)); // Lưu thông tin user

      // ✅ redirect dashboard
      onLoginSuccess({
        name: user.name,
        id: user.id,
        email: user.email,
        companyId: user.companyId, // Thêm companyId
      });
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Đăng nhập thất bại'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-4 flex items-center space-x-2 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('backToHome')}</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl mb-4">
              <Building2 className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl mb-2">
              {t('companyAdminTitle')}
            </h1>

            <p className="text-gray-500">
              {t('companyLoginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Identifier */}
            <div>
              <label className="block text-sm mb-2">
                Email / Phone
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc số điện thoại"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2">
                {t('password')}
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Đang đăng nhập...' : t('login')}
            </button>

            {/* Forgot Password */}
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-indigo-500"
            >
              {t('forgotPassword')}
            </button>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal
          userType="company"
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
}