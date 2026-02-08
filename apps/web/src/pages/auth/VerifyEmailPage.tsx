import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import api from '../../../../portal/src/api/api';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token xác thực không hợp lệ');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyEmail = async () => {
      try {
        const res = await api.get('/auth/verify-email', {
          params: { token },
        });

        const { success, message, accessToken, user } = res.data;

        if (!success) throw new Error(message);

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        setStatus('success');
        setMessage(message || 'Xác thực email thành công');

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Xác thực email thất bại';

        setStatus('error');
        setMessage(msg);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Xác thực Email
            </h2>

            <div className="w-10" />
          </div>

          {/* ICON */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
              <Mail className="w-10 h-10" />
            </div>
          </div>

          {/* BODY */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Đang xác thực email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <p className="text-lg font-semibold text-green-600">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Đang đăng nhập và chuyển hướng...
              </p>

              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl"
              >
                Vào trang chủ ngay
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <p className="text-lg font-semibold text-red-600">
                Xác thực thất bại
              </p>
              <p className="text-sm text-gray-500">{message}</p>

              <div className="space-y-3 mt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl"
                >
                  Đi tới đăng nhập
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 border-2 border-gray-300 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300"
                >
                  Quay về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
