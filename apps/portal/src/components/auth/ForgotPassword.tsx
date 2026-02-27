import { useState } from 'react';
import { X, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';
import { authApi } from '@obtp/api-client';

interface ForgotPasswordModalProps {
  onClose: () => void;
  userType: string;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage('');

      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="obtp-modal-overlay">
      <div className="obtp-card obtp-card-strong obtp-modal">
        <div className="obtp-modal-header">
          <button
            onClick={handleClose}
            className="obtp-icon-btn"
            style={{ position: 'absolute', right: 12, top: 12, borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}
            aria-label="Đóng"
            type="button"
          >
            <X size={18} style={{ color: 'white' }} />
          </button>

          <h2 className="obtp-modal-title">{t('forgotPasswordCompany')}</h2>
          <p className="obtp-modal-subtitle">{t('enterEmailToReset')}</p>
        </div>

        <div className="obtp-modal-body">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              {errorMessage && <div className="obtp-error">{errorMessage}</div>}

              <div className="obtp-field">
                <label className="obtp-label">{t('registeredEmail')}</label>
                <div className="obtp-input-wrap">
                  <span className="obtp-input-icon" aria-hidden="true">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="obtp-input obtp-input-pad"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="obtp-btn">
                {isLoading ? t('sendingEmail') : t('sendResetLinkButton')}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', display: 'grid', gap: 10, padding: '10px 0 6px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(37,99,235,.95), rgba(20,184,166,.92))',
                  color: 'white',
                }}
              >
                <CheckCircle size={30} />
              </div>

              <div style={{ fontWeight: 900, fontSize: 18 }}>{t('emailSentSuccess')}</div>
              <div style={{ color: 'var(--obtp-muted2)', fontSize: 13 }}>
                {t('checkEmailMessage')} <strong>{email}</strong>
              </div>

              <button onClick={handleClose} type="button" className="obtp-btn-secondary">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <ArrowLeft size={16} />
                  <span>{t('backToLogin')}</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
