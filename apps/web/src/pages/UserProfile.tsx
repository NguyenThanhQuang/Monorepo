import {
  ArrowLeft,
  Lock,
  Save,
  Edit2,
  Star,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { useUserProfileLogic } from '../hooks/Logic/UserProfile.logic';

export function UserProfilePage({ onBack }: { onBack: () => void }) {
  const {
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
  } = useUserProfileLogic();

  if (!user) return null;

  /* ================= SAFE AVATAR CHAR ================= */
  const avatarChar =
    user.name && user.name.trim().length > 0
      ? user.name.trim().charAt(0).toUpperCase()
      : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-6">
      {/* ================= HEADER ================= */}
      <header className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-white">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">
          Thông Tin Cá Nhân
        </h1>
      </header>

      {/* ================= PROFILE CARD ================= */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-3xl p-8 shadow-xl">
        {/* AVATAR */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-semibold">
              {avatarChar}
            </div>
            <button className="absolute bottom-0 right-0 bg-[#334155] p-2 rounded-full">
              <Edit2 size={14} />
            </button>
          </div>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-5">
          {/* NAME */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Họ và tên
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={user.name || ''}
                disabled={!isEditing}
                onChange={(e) =>
                  setUser({
                    ...user,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full bg-[#020617] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-gray-400"
                value={user.email}
                disabled
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email không thể thay đổi
            </p>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-3"
                value={user.phone || ''}
                disabled={!isEditing}
                onChange={(e) =>
                  setUser({
                    ...user,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex gap-4 mt-8">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium"
              >
                <Edit2 size={18} />
                Chỉnh sửa
              </button>

              <button
                onClick={() => setShowChangePassword(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#334155] hover:bg-[#475569] py-3 rounded-xl font-medium"
              >
                <Lock size={18} />
                Đổi mật khẩu
              </button>
            </>
          ) : (
            <button
              onClick={saveProfile}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-medium"
            >
              <Save size={18} />
              Lưu thay đổi
            </button>
          )}
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="max-w-4xl mx-auto mt-10 bg-[#1e293b] rounded-3xl p-8">
        <h2 className="text-lg font-semibold mb-4">
          Đánh giá của bạn
        </h2>

        {reviews.length === 0 && (
          <p className="text-gray-400">
            Bạn chưa có đánh giá nào
          </p>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-[#0f172a] border border-[#334155] rounded-xl p-4"
            >
              <div className="flex gap-1 text-yellow-400 mb-2">
                {Array.from({ length: review.rating }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                    />
                  ),
                )}
              </div>

              {review.comment && (
                <p className="text-gray-200 mb-2">
                  {review.comment}
                </p>
              )}

              <div className="text-sm text-gray-400">
                {review.companyId?.name} ·{' '}
                {review.tripId?.name}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {new Date(
                  review.createdAt,
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#020617] rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">
              Đổi mật khẩu
            </h3>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3"
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
                placeholder="Mật khẩu mới"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3"
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
                placeholder="Xác nhận mật khẩu mới"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-[#334155] py-3 rounded-xl"
              >
                Hủy
              </button>

              <button
                onClick={submitChangePassword}
                className="flex-1 bg-blue-600 py-3 rounded-xl"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
