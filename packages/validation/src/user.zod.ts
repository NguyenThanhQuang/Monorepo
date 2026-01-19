import { AUTH_CONSTANTS, BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { UserRole } from "@obtp/shared-types";
import { z } from "zod";

// Import reusable password schema (private constant inside validation package, copy here for context)
const passwordStrongSchema = z
  .string()
  .min(AUTH_CONSTANTS.DEFAULTS.MIN_NEW_PASSWORD_LENGTH)
  .regex(
    AUTH_CONSTANTS.PASSWORD_STRONG_REGEX,
    "Mật khẩu yếu, yêu cầu ký tự hoa, thường, số, ký tự đặc biệt",
  );

// Schemas

export const UpdateUserSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phone: z
    .string()
    .regex(
      AUTH_CONSTANTS.VN_PHONE_REGEX,
      "Số điện thoại không đúng định dạng VN",
    )
    .optional(),
  // Email thường không cho update trực tiếp mà qua quy trình change-email riêng
});

export const CreateUserInternalSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .regex(AUTH_CONSTANTS.VN_PHONE_REGEX, "Số điện thoại VN không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  name: z.string().min(1, "Tên bắt buộc"),
  role: z.nativeEnum(UserRole).optional(),
  // FIX: Sử dụng BUSINESS_CONSTANTS.REGEX.MONGO_ID (đã define ở giai đoạn Common)
  companyId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "CompanyID không hợp lệ")
    .optional(),
});

export const UpdateUserStatusSchema = z.object({
  isBanned: z.boolean({ error: "Trạng thái cấm phải là true/false" }),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại bắt buộc"),
    newPassword: passwordStrongSchema,
    confirmNewPassword: z.string().min(1, "Xác nhận mật khẩu bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

export const CreateCompanyAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(AUTH_CONSTANTS.VN_PHONE_REGEX),
  companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),
});
