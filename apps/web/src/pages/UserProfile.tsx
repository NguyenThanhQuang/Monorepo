import { ArrowLeft, Lock, Save, Edit2, Star } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <header className="flex items-center gap-3 mb-6">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">Thông tin cá nhân</h1>
      </header>

      {/* ================= PROFILE INFO ================= */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Thông tin cá nhân</h2>

        <div className="space-y-4">
          <div>
            <label>Họ và tên</label>
            <input
              className="w-full border rounded-lg p-2"
              value={user.name}
              disabled={!isEditing}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
            />
          </div>

          <div>
            <label>Email</label>
            <input
              className="w-full border rounded-lg p-2 bg-gray-100"
              value={user.email}
              disabled
            />
          </div>

          <div>
            <label>Số điện thoại</label>
            <input
              className="w-full border rounded-lg p-2"
              value={user.phone || ''}
              disabled={!isEditing}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Edit2 size={16} />
                Chỉnh sửa
              </button>

              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg"
              >
                <Lock size={16} />
                Đổi mật khẩu
              </button>
            </>
          ) : (
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Save size={16} />
              Lưu thay đổi
            </button>
          )}
        </div>
      </div>

      {/* ================= USER REVIEWS ================= */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Đánh giá của bạn</h2>

        {reviews.length === 0 && (
          <p className="text-gray-500">
            Bạn chưa có đánh giá nào
          </p>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border rounded-xl p-4"
            >
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {Array.from({ length: review.rating }).map(
                  (_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ),
                )}
              </div>

              {review.comment && (
                <p className="mb-2">{review.comment}</p>
              )}

              <div className="text-sm text-gray-500">
                {review.companyId?.name} ·{' '}
                {review.tripId?.name}
              </div>

              <div className="text-xs text-gray-400 mt-1">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Đổi mật khẩu</h3>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="w-full border rounded-lg p-2"
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
                className="w-full border rounded-lg p-2"
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
                className="w-full border rounded-lg p-2"
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
                className="flex-1 py-2 bg-gray-200 rounded-lg"
              >
                Hủy
              </button>

              <button
                onClick={submitChangePassword}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
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
