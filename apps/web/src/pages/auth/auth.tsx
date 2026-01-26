import {
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { useAuthLogic } from '../../hooks/Logic/useAuthLogic';

interface AuthProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function Auth({ onClose, onLoginSuccess }: AuthProps) {
  const logic = useAuthLogic({ onLoginSuccess });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose}>
              <ArrowLeft />
            </button>

            <h2>
              {logic.mode === 'login' && logic.t('login')}
              {logic.mode === 'register' && logic.t('register')}
              {logic.mode === 'forgot-password' &&
                logic.t('forgotPassword')}
            </h2>

            <div className="w-8" />
          </div>

          {/* FORM */}
          <form onSubmit={logic.handleSubmit} className="space-y-4">

            {logic.mode === 'register' && (
              <>
                <input
                  placeholder={logic.t('fullName')}
                  value={logic.fullName}
                  onChange={(e) => logic.setFullName(e.target.value)}
                />

                <input
                  placeholder={logic.t('phone')}
                  value={logic.phone}
                  onChange={(e) => logic.setPhone(e.target.value)}
                />
              </>
            )}

            <input
              type="email"
              placeholder={logic.t('email')}
              value={logic.email}
              onChange={(e) => logic.setEmail(e.target.value)}
            />

            {logic.mode !== 'forgot-password' && (
              <div className="relative">
                <input
                  type={logic.showPassword ? 'text' : 'password'}
                  placeholder={logic.t('password')}
                  value={logic.password}
                  onChange={(e) => logic.setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    logic.setShowPassword(!logic.showPassword)
                  }
                >
                  {logic.showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            )}

            {logic.mode === 'register' && (
              <input
                type={
                  logic.showConfirmPassword ? 'text' : 'password'
                }
                placeholder={logic.t('confirmPassword')}
                value={logic.confirmPassword}
                onChange={(e) =>
                  logic.setConfirmPassword(e.target.value)
                }
              />
            )}

            <button
              type="submit"
              disabled={logic.loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl"
            >
              {logic.loading
                ? logic.t('loading')
                : logic.mode === 'login'
                ? logic.t('login')
                : logic.mode === 'register'
                ? logic.t('register')
                : logic.t('resetPassword')}
            </button>
          </form>

          {/* SWITCH MODE */}
          <div className="mt-4 text-center">
            {logic.mode === 'login' && (
              <button onClick={() => logic.setMode('register')}>
                {logic.t('registerNow')}
              </button>
            )}

            {logic.mode === 'register' && (
              <button onClick={() => logic.setMode('login')}>
                {logic.t('loginNow')}
              </button>
            )}

            {logic.mode === 'forgot-password' && (
              <button onClick={() => logic.setMode('login')}>
                {logic.t('backToLogin')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
