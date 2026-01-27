// src/pages/user-profile/UserProfile.logic.ts

import { useEffect, useState } from 'react';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from './userProfile.api';
import type { UserProfileResponse } from '@obtp/shared-types';

export function useUserProfileLogic() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setLoading(true);
    getMyProfile()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await updateMyProfile({
        name: user.name,
        phone: user.phone,
      });
      setUser(updated);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const submitChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }

    await changeMyPassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
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
    loading,
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
