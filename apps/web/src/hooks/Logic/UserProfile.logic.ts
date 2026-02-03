import { useEffect, useState } from 'react';
import type { UserProfileResponse } from '@obtp/shared-types';

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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
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
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    }

    fetchData();
  }, []);

  const saveProfile = async () => {
    if (!user) return;

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
  };

  const submitChangePassword = async () => {
    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }

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
    saveProfile,
    submitChangePassword,
  };
}
