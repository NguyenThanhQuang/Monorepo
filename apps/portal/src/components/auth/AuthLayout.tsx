import { useState } from 'react';
import { User, Lock, Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForgotPasswordModal } from './ForgotPassword';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '@obtp/api-client';
import { UserRole } from '@obtp/shared-types';

interface AdminLoginProps {
  onBack: () => void;
}

export function AdminLogin({ onBack }: AdminLoginProps) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

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

      const res = await authApi.login({ identifier, password });
      const { accessToken, user } = res;

      if (!user.roles?.includes(UserRole.COMPANY_ADMIN)) {
        setErrorMessage('Tài khoản không có quyền quản trị công ty.');
        return;
      }

      login(accessToken, {
        name: user.name,
        id: user.id,
        email: user.email,
        roles: user.roles,
        companyId: user.companyId,
      });

      navigate('/company/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="obtp-auth">
      <div style={{ width: '100%', maxWidth: 460 }}>
        <button
          onClick={onBack}
          className="obtp-btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}
          type="button"
        >
          <ArrowLeft size={18} />
          <span>{t('backToHome')}</span>
        </button>

        <div className="obtp-card obtp-card-strong obtp-auth-card">
          <div className="obtp-auth-header">
            <div className="obtp-auth-logo" aria-hidden="true">
              <Building2 size={34} />
            </div>
            <h1 className="obtp-auth-title">{t('companyAdminTitle')}</h1>
            <p className="obtp-auth-subtitle">{t('companyLoginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            {errorMessage && <div className="obtp-error">{errorMessage}</div>}

            <div className="obtp-field">
              <label className="obtp-label">Email / Phone</label>
              <div className="obtp-input-wrap">
                <span className="obtp-input-icon" aria-hidden="true">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc số điện thoại"
                  className="obtp-input obtp-input-pad"
                  required
                />
              </div>
            </div>

            <div className="obtp-field">
              <label className="obtp-label">{t('password')}</label>
              <div className="obtp-input-wrap">
                <span className="obtp-input-icon" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className="obtp-input obtp-input-pad"
                  required
                />
              </div>
            </div>

            <div className="obtp-auth-actions">
              <button type="submit" disabled={isLoading} className="obtp-btn">
                {isLoading ? 'Đang đăng nhập…' : t('login')}
              </button>
              <button type="button" onClick={() => setShowForgotPassword(true)} className="obtp-link">
                {t('forgotPassword')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal userType="company" onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
