import { z } from "zod";

// Regex Password: Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 đặc biệt
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Regex Phone VN cơ bản
const PHONE_REGEX_VN = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

const passwordRule = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(
    PASSWORD_REGEX,
    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  );

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Email hoặc SĐT không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  phone: z
    .string()
    .regex(PHONE_REGEX_VN, "Số điện thoại không đúng định dạng VN"),
  password: passwordRule,
  name: z.string().min(1, "Tên không được để trống"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token không hợp lệ"),
    newPassword: passwordRule,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmNewPassword"],
  });

export const ActivateAccountSchema = z
  .object({
    token: z.string().min(1, "Token không hợp lệ"),
    newPassword: passwordRule,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmNewPassword"],
  });

export const ResendVerificationSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
});
