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

  // Hàm kiểm tra role
  const isAllowedRole = (roles: string[] | undefined): boolean => {
    if (!roles || roles.length === 0) return false;
    
    // Chỉ cho phép role USER đăng nhập
    return roles.includes(UserRole.USER) && roles.length === 1;
  };

  // Hàm lấy tên role hiển thị
  const getRoleDisplayName = (roles: string[]): string => {
    if (roles.includes(UserRole.ADMIN)) return 'Quản trị viên';
    if (roles.includes(UserRole.COMPANY_ADMIN)) return 'Quản lý nhà xe';
    if (roles.includes(UserRole.STAFF)) return 'Nhân viên';
    return 'Không xác định';
  };

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

        // Kiểm tra role của user
        const userRoles = user.roles || [];
        
        if (!isAllowedRole(userRoles)) {
          const roleName = getRoleDisplayName(userRoles);
          
          // Hiển thị toast thông báo
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

          // Hiển thị hướng dẫn chi tiết
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

        // Nếu là user hợp lệ, tiến hành lưu thông tin
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Hiển thị thông báo thành công
        toast.success('Đăng nhập thành công!', {
          duration: 2000,
          position: 'top-center',
          icon: '🎉',
        });

        onLoginSuccess(user);
        return;
      }

      // ===== REGISTER =====
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp', {
            duration: 3000,
            position: 'top-center',
            icon: '❌',
          });
          return;
        }

        await registerApi({
          email,
          password,
          name: fullName,
          phone,
        });

        toast.success('Đăng ký thành công! Vui lòng đăng nhập.', {
          duration: 3000,
          position: 'top-center',
          icon: '✅',
        });

        setMode('login');
        return;
      }

      // ===== FORGOT PASSWORD =====
      if (mode === 'forgot-password') {
        await forgotPasswordApi({ email });
        
        toast.success('Email đặt lại mật khẩu đã được gửi!', {
          duration: 3000,
          position: 'top-center',
          icon: '📧',
        });
        
        return;
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      
      toast.error(errorMessage, {
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

    handleSubmit,
  };
}