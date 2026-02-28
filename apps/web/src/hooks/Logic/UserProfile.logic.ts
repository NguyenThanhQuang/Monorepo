import { useEffect, useState } from 'react';
import type { UserProfileResponse } from '@obtp/shared-types';
import toast from 'react-hot-toast';

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from '../../api/userProfile.api';

import { getMyReviewsApi } from '../../api/service/review/review.api';

export function useUserProfileLogic() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password validation checks
  const passwordChecks = {
    minLength: passwordData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwordData.newPassword),
    lower: /[a-z]/.test(passwordData.newPassword),
    number: /\d/.test(passwordData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isPasswordMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '';

  // Hàm xử lý lỗi từ API
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
          errorMessage = data?.message || 'Không có quyền thực hiện';
          break;
        case 403:
          errorMessage = data?.message || 'Không được phép';
          break;
        case 404:
          errorMessage = data?.message || 'Không tìm thấy thông tin';
          break;
        case 409:
          errorMessage = data?.message || 'Dữ liệu đã tồn tại';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = data?.message || errorMessage;
      }
    } else if (error?.request) {
      errorMessage = 'Không thể kết nối đến máy chủ';
    } else {
      errorMessage = error?.message || errorMessage;
    }
    
    return errorMessage;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        /* ===== PROFILE ===== */
        const profileRes: any = await getMyProfile();
        console.log('PROFILE API 👉', profileRes);

        const profile = profileRes.data;

        setUser({
          ...profile,
          name: profile.name ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
        });

        /* ===== REVIEWS ===== */
        const reviewsRes: any = await getMyReviewsApi();
        console.log('REVIEWS API 👉', reviewsRes);

        setReviews(
          Array.isArray(reviewsRes.data)
            ? reviewsRes.data
            : [],
        );
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        toast.error(handleApiError(err), {
          duration: 3000,
          position: 'top-center',
          icon: '❌',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const res: any = await updateMyProfile({
        name: user.name,
        phone: user.phone,
      });

      const updated = res.data;

      setUser({
        ...updated,
        name: updated.name ?? '',
        phone: updated.phone ?? '',
      });

      setIsEditing(false);
      
      toast.success('Cập nhật thông tin thành công!', {
        duration: 2000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const submitChangePassword = async () => {
    // Validate password
    if (!passwordData.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại', {
        duration: 3000,
        position: 'top-center',
        icon: '🔒',
      });
      return;
    }

    if (!isPasswordValid) {
      toast.error('Mật khẩu mới không đáp ứng yêu cầu bảo mật', {
        duration: 3000,
        position: 'top-center',
        icon: '🔒',
      });
      return;
    }

    if (!isPasswordMatch) {
      toast.error('Mật khẩu xác nhận không khớp', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
      });
      return;
    }

    try {
      setLoading(true);
      
      await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });

      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Đổi mật khẩu thành công!', {
        duration: 2000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    setUser,
    reviews,
    isEditing,
    setIsEditing,
    showChangePassword,
    setShowChangePassword,
    passwordData,
    setPasswordData,
    passwordChecks,
    isPasswordValid,
    isPasswordMatch,
    loading,
    saveProfile,
    submitChangePassword,
  };
}