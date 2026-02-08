import { useState } from 'react';
import { X, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';
import { authApi } from '@obtp/api-client';

interface ForgotPasswordModalProps {
  onClose: () => void;
    userType: string; // thêm dòng này

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

      await authApi.forgotPassword({
        email,
      });

      // backend luôn trả success để tránh lộ email tồn tại hay không
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu'
      );
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <h2 className="text-2xl text-white">
            {t('forgotPasswordCompany')}
          </h2>

          <p className="text-white/80 text-sm mt-1">
            {t('enterEmailToReset')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ERROR */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="block text-sm mb-2">
                  {t('registeredEmail')}
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('sendingEmail')}</span>
                  </span>
                ) : (
                  t('sendResetLinkButton')
                )}
              </button>

            </form>
          ) : (

            // SUCCESS UI
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl text-gray-900 dark:text-white">
                {t('emailSentSuccess')}
              </h3>

              <p className="text-gray-600 dark:text-gray-400">
                {t('checkEmailMessage')} <strong>{email}</strong>
              </p>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
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
