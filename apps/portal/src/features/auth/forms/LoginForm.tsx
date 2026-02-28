import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { LoginSchema } from "@obtp/validation";
import { UserRole, type LoginPayload } from "@obtp/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "../api/useLogin";

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {globalError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {globalError}
        </div>
      )}

      <div className="obtp-field">
        <label className="obtp-label">Email / Số điện thoại</label>
        <div className="obtp-input-wrap">
          <span className="obtp-input-icon">
            <User size={18} className="text-slate-400" />
          </span>
          <Input
            {...register("identifier")}
            placeholder="Nhập email hoặc số điện thoại"
            className="pl-10"
          />
        </div>
        {errors.identifier && (
          <p className="text-sm text-red-500 mt-1">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="obtp-field">
        <label className="obtp-label">Mật khẩu</label>
        <div className="obtp-input-wrap">
          <span className="obtp-input-icon">
            <Lock size={18} className="text-slate-400" />
          </span>
          <Input
            type="password"
            {...register("password")}
            placeholder="Nhập mật khẩu"
            className="pl-10"
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </div>
    </form>
  );
}
