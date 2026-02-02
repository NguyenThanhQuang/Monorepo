import { useEffect, useState } from 'react';

import type { UserProfileResponse } from '@obtp/shared-types';
import { getMyReviewsApi } from '../../api/service/review/review.api';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../api/userProfile.api';

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
    getMyProfile().then(setUser);
    getMyReviewsApi().then(setReviews);
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    const updated = await updateMyProfile({
      name: user.name,
      phone: user.phone,
    });
    setUser(updated);
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
    confirmNewPassword: passwordData.confirmPassword, // ✅ BẮT BUỘC
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
    reviews,
    isEditing,
    setIsEditing,
    showChangePassword,
    setShowChangePassword,
    passwordData,
    setPasswordData,
    saveProfile,
    submitChangePassword,
    setUser,
  };
}
