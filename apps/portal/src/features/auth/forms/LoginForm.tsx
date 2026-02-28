import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

import { LoginSchema } from "@obtp/validation";
import { z } from "zod";
import { useLogin } from "../api/useLogin";
import { UserRole, type LoginPayload } from "@obtp/shared-types";

type FormData = z.input<typeof LoginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginPayload) => {
    setGlobalError(null);
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        const { accessToken, user } = res;

        const hasAccess =
          user.roles?.includes(UserRole.COMPANY_ADMIN) ||
          user.roles?.includes(UserRole.ADMIN);
        if (!hasAccess) {
          setGlobalError("Tài khoản của bạn không có quyền quản trị nhà xe.");
          return;
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("authUser", JSON.stringify(user));

        navigate("/company/dashboard", { replace: true });
      },
      onError: (err: any) => {
        setGlobalError(
          err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.",
        );
      },
    });
  };

  return (
    /* Sử dụng style inline gap từ source gốc */
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "grid", gap: 14 }}
    >
      {globalError && <div className="obtp-error">{globalError}</div>}

      <div className="obtp-field">
        <label className="obtp-label">Email / Số điện thoại</label>
        <div className="obtp-input-wrap">
          <span className="obtp-input-icon" aria-hidden="true">
            <User size={18} />
          </span>
          <input
            {...register("identifier")}
            type="text"
            placeholder="Nhập email hoặc số điện thoại"
            className="obtp-input obtp-input-pad"
            required
          />
        </div>
        {errors.identifier && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="obtp-field">
        <label className="obtp-label">Mật khẩu</label>
        <div className="obtp-input-wrap">
          <span className="obtp-input-icon" aria-hidden="true">
            <Lock size={18} />
          </span>
          <input
            {...register("password")}
            type="password"
            placeholder="Nhập mật khẩu"
            className="obtp-input obtp-input-pad"
            required
          />
        </div>
        {errors.password && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="obtp-auth-actions">
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="obtp-btn"
        >
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </form>
  );
}
