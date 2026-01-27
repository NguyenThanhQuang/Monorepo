// src/pages/user-profile/UserProfile.page.tsx

import {
  ArrowLeft,
  User as UserIcon,

} from 'lucide-react';
import { useUserProfileLogic } from '../hooks/Logic/UserProfile.logic';

export function UserProfilePage({ onBack }: { onBack: () => void }) {
  const {
    user,
    isEditing,
    setIsEditing,
    showChangePassword,
    setShowChangePassword,
    passwordData,
    setPasswordData,
    saveProfile,
    submitChangePassword,
    setUser,
  } = useUserProfileLogic();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <button onClick={onBack} className="p-4">
          <ArrowLeft />
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl">
        <input
          value={user.name}
          disabled={!isEditing}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <input value={user.email} disabled />

        <input
          value={user.phone}
          disabled={!isEditing}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
        ) : (
          <button onClick={saveProfile}>Lưu</button>
        )}

        <button onClick={() => setShowChangePassword(true)}>
          Đổi mật khẩu
        </button>
      </div>

      {showChangePassword && (
        <div>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />
          <button onClick={submitChangePassword}>Xác nhận</button>
        </div>
      )}
    </div>
  );
}
