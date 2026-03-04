import { authApi } from "@obtp/api-client";
import { UserRole } from "@obtp/shared-types";
import { useState } from "react";
import toast from "react-hot-toast";

interface UseAuthLogicProps {
  onLoginSuccess: (user: any) => void;
}

export function useAuthLogic({ onLoginSuccess }: UseAuthLogicProps) {
  const [mode, setMode] = useState<
    "login" | "register" | "forgot-password" | "verify-email"
  >("login");

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAllowedRole = (roles: UserRole[] | undefined): boolean => {
    if (!roles || roles.length === 0) return false;
    return roles.includes(UserRole.USER);
  };

  const handleApiError = (err: any): string => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message) return err.message;
    return "Có lỗi xảy ra, vui lòng thử lại";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const response = await authApi.login({
          identifier: email,
          password,
        });

        const { accessToken, user } = response as any;

        if (!user || !isAllowedRole(user.roles)) {
          toast.error("Tài khoản này không có quyền truy cập Customer Web.", {
            duration: 4000,
            icon: "🚫",
          });
          setLoading(false);
          return;
        }

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Đăng nhập thành công!");
        onLoginSuccess(user);
        return;
      }

      if (mode === "register") {
        if (password !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp");
          setLoading(false);
          return;
        }

        await authApi.register({
          email,
          password,
          confirmPassword,
          name: fullName,
          phone,
        });

        setRegisteredEmail(email);
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
        setMode("verify-email");
        setLoading(false);
        return;
      }

      if (mode === "forgot-password") {
        await authApi.forgotPassword({ email });
        toast.success("Email đặt lại mật khẩu đã được gửi!");

        setTimeout(() => setMode("login"), 3000);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      const msg = handleApiError(err);
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    try {
      setLoading(true);
      await authApi.resendVerificationEmail({ email: registeredEmail });
      toast.success("Đã gửi lại email xác thực!");
    } catch (err: any) {
      toast.error(handleApiError(err));
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
