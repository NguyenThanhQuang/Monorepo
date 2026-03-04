import { reviewsApi, usersApi } from "@obtp/api-client";
import type { Review, SanitizedUserResponse } from "@obtp/shared-types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useUserProfileLogic() {
  const [user, setUser] = useState<SanitizedUserResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordChecks = {
    minLength: passwordData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwordData.newPassword),
    lower: /[a-z]/.test(passwordData.newPassword),
    number: /\d/.test(passwordData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isPasswordMatch =
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.confirmPassword !== "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, reviewsData] = await Promise.all([
          usersApi.getMe(),
          reviewsApi.getMyReviews(),
        ]);

        const profile = (userData as any).data || userData;
        setUser(profile);

        let listReviews: Review[] = [];
        if (Array.isArray(reviewsData)) {
          listReviews = reviewsData;
        } else if (
          (reviewsData as any).data &&
          Array.isArray((reviewsData as any).data)
        ) {
          listReviews = (reviewsData as any).data;
        }
        setReviews(listReviews);
      } catch (error: any) {
        console.error("Fetch profile error:", error);
        if (error.response?.status !== 401) {
          toast.error("Không thể tải thông tin cá nhân");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    if (!user.name?.trim()) {
      toast.error("Tên không được để trống");
      return;
    }

    try {
      setLoading(true);

      const response = await usersApi.updateMe({
        name: user.name,
        phone: user.phone,
      });

      const updatedUser = (response as any).data || response;

      setUser(updatedUser);
      setIsEditing(false);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      const msg = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Mật khẩu mới chưa đủ mạnh");
      return;
    }

    if (!isPasswordMatch) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await usersApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setShowChangePassword(false);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Change password error:", error);
      const msg = error.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(msg);
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
