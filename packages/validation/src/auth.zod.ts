import { PASSWORD_STRONG_REGEX } from "@obtp/business-logic";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
  .regex(PASSWORD_STRONG_REGEX, {
    message:
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  });

export const RegisterSchema = z.object({
  email: z.email({ message: "Email không đúng định dạng" }),

  phone: z.string().min(1, { message: "Số điện thoại không được để trống" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  name: z.string().min(1, { message: "Tên không được để trống" }),
});

export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Email hoặc Số điện thoại không được để trống" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const ResendVerificationSchema = z.object({
  email: z.email({ message: "Email không đúng định dạng" }),
});

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: "Email không đúng định dạng" }),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token không được để trống" }),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmNewPassword"],
  });

export const ActivateAccountSchema = z
  .object({
    token: z.string().min(1, { message: "Token không được để trống" }),
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự" }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmNewPassword"],
  });
