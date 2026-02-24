import { useState } from 'react';
import {
  forgotPasswordApi,
  loginApi,
  registerApi,
} from '../../api/service/auth/auth.api';
import toast from 'react-hot-toast';
import { UserRole } from '@obtp/shared-types';



export function useAuthLogic({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: any) => void;
}) {
  const [mode, setMode] = useState<
    'login' | 'register' | 'forgot-password' | 'verify-email'
  >('login');
  
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm kiểm tra role
  const isAllowedRole = (roles: string[] | undefined): boolean => {
    if (!roles || roles.length === 0) return false;
    return roles.includes(UserRole.USER) && roles.length === 1;
  };

  // Hàm lấy tên role hiển thị
  const getRoleDisplayName = (roles: string[]): string => {
    if (roles.includes(UserRole.ADMIN)) return 'Quản trị viên';
    if (roles.includes(UserRole.COMPANY_ADMIN)) return 'Quản lý nhà xe';
    if (roles.includes(UserRole.STAFF)) return 'Nhân viên';
    return 'Không xác định';
  };

  // Hàm xử lý lỗi từ backend
  const handleApiError = (error: any): string => {
    let errorMessage = 'Có lỗi xảy ra';
    
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Dữ liệu không hợp lệ';
          break;
        case 401:
          errorMessage = data?.message || 'Email hoặc mật khẩu không chính xác';
          break;
        case 403:
          errorMessage = data?.message || 'Tài khoản chưa được xác thực email';
          break;
        case 404:
          errorMessage = data?.message || 'Không tìm thấy thông tin';
          break;
        case 409:
          errorMessage = data?.message || 'Email hoặc số điện thoại đã tồn tại';
          break;
        case 422:
          errorMessage = data?.message || 'Dữ liệu không hợp lệ';
          break;
        case 429:
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = data?.message || errorMessage;
      }
      
      if (data?.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map((e: any) => e.message).join(', ');
      }
    } else if (error?.request) {
      errorMessage = 'Không thể kết nối đến máy chủ';
    } else {
      errorMessage = error?.message || errorMessage;
    }
    
    return errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // LOGIN
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

        // Kiểm tra role
        const userRoles = user.roles || [];
        
        if (!isAllowedRole(userRoles)) {
          const roleName = getRoleDisplayName(userRoles);
          
          toast.error(
            `Tài khoản ${roleName} không thể đăng nhập vào trang này. Vui lòng sử dụng cổng đăng nhập phù hợp.`,
            {
              duration: 5000,
              position: 'top-center',
              icon: '🚫',
              style: {
                background: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
                maxWidth: '500px',
              },
            }
          );

          if (userRoles.includes(UserRole.ADMIN)) {
            toast('👉 Vui lòng đăng nhập tại trang Quản trị hệ thống', {
              duration: 5000,
              position: 'top-center',
              icon: '⚙️',
            });
          } else if (userRoles.includes(UserRole.COMPANY_ADMIN)) {
            toast('👉 Vui lòng đăng nhập tại trang Quản lý nhà xe', {
              duration: 5000,
              position: 'top-center',
              icon: '🏢',
            });
          } else if (userRoles.includes(UserRole.STAFF)) {
            toast('👉 Vui lòng đăng nhập tại trang Nhân viên', {
              duration: 5000,
              position: 'top-center',
              icon: '👤',
            });
          }

          setLoading(false);
          return;
        }

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Đăng nhập thành công!', {
          duration: 2000,
          position: 'top-center',
          icon: '🎉',
        });

        onLoginSuccess(user);
        return;
      }

      // REGISTER
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp', {
            duration: 3000,
            position: 'top-center',
            icon: '❌',
          });
          setLoading(false);
          return;
        }

        try {
          const res = await registerApi({
            email,
            password,
            name: fullName,
            phone,
          });

          setRegisteredEmail(email);
          
          toast.success(
            (t) => (
              <div>
                <p className="font-bold">Đăng ký thành công!</p>
                <p className="text-sm">Vui lòng kiểm tra email <span className="font-semibold">{email}</span> để xác thực tài khoản.</p>
                <p className="text-xs mt-1">(Kiểm tra cả thư mục Spam nếu không thấy)</p>
              </div>
            ),
            {
              duration: 8000,
              position: 'top-center',
              icon: '📧',
              style: {
                background: '#10B981',
                color: '#FFFFFF',
                maxWidth: '400px',
              },
            }
          );

          setMode('verify-email');
          
        } catch (error: any) {
          const errorMessage = handleApiError(error);
          toast.error(errorMessage, {
            duration: 4000,
            position: 'top-center',
            icon: '❌',
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
            },
          });
        }
        
        setLoading(false);
        return;
      }

      // FORGOT PASSWORD
      if (mode === 'forgot-password') {
        try {
          await forgotPasswordApi({ email });
          
          toast.success(
            (t) => (
              <div>
                <p className="font-bold">Email đặt lại mật khẩu đã được gửi!</p>
                <p className="text-sm">Vui lòng kiểm tra email <span className="font-semibold">{email}</span></p>
                <p className="text-xs mt-1">(Kiểm tra cả thư mục Spam nếu không thấy)</p>
              </div>
            ),
            {
              duration: 6000,
              position: 'top-center',
              icon: '📧',
              style: {
                background: '#10B981',
                color: '#FFFFFF',
              },
            }
          );
          
          setTimeout(() => {
            setMode('login');
          }, 3000);
          
        } catch (error: any) {
          const errorMessage = handleApiError(error);
          toast.error(errorMessage, {
            duration: 4000,
            position: 'top-center',
            icon: '❌',
          });
        }
        
        setLoading(false);
        return;
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      setLoading(false);
    }
  };

  // Hàm gửi lại email xác thực
  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    try {
      setLoading(true);
      // TODO: Gọi API resend verification
      
      toast.success('Đã gửi lại email xác thực!', {
        duration: 3000,
        position: 'top-center',
        icon: '📧',
      });
    } catch (error: any) {
      toast.error(handleApiError(error), {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
      });
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

    registeredEmail,
    handleResendVerification,

    handleSubmit,
  };
}