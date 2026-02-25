import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@obtp/validation";
import type { LoginPayload } from "@obtp/shared-types";
import { AlertCircle, Building2 } from "lucide-react";
import { Input } from "../../../shared/components/ui/input";
import { Button } from "../../../shared/components/ui/button";
import { useLogin } from "../hooks/use-login";

export const LoginForm = () => {
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema as any),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginPayload) => {
    mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản Trị Nhà Xe
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Đăng nhập để quản lý đội xe và chuyến đi của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tài khoản / SĐT
            </label>
            <Input
              {...register("identifier")}
              placeholder="admin@example.com"
              error={errors.identifier?.message}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              error={errors.password?.message}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>
              {(error as Error).message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra lại."}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isPending}>
          Đăng nhập hệ thống
        </Button>
      </form>
    </div>
  );
};
