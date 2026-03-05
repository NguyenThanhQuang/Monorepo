import { AUTH_CONSTANTS, BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { UserRole } from "@obtp/shared-types";
import { z } from "zod";

const passwordStrongSchema = z
  .string()
  .min(AUTH_CONSTANTS.DEFAULTS.MIN_NEW_PASSWORD_LENGTH, {
    message: `Mật khẩu phải có ít nhất ${AUTH_CONSTANTS.DEFAULTS.MIN_NEW_PASSWORD_LENGTH} ký tự`,
  })
  .regex(AUTH_CONSTANTS.PASSWORD_STRONG_REGEX, {
    message: "Mật khẩu yếu, yêu cầu ký tự hoa, thường, số, ký tự đặc biệt",
  });

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
    .optional(),
  phone: z
    .string()
    .regex(AUTH_CONSTANTS.VN_PHONE_REGEX, {
      message: "Số điện thoại không đúng định dạng VN",
    })
    .optional(),
});

export const CreateUserInternalSchema = z.object({
  email: z.email({ message: "Email không hợp lệ" }),

  phone: z.string().regex(AUTH_CONSTANTS.VN_PHONE_REGEX, {
    message: "Số điện thoại VN không hợp lệ",
  }),

  password: z.string().min(6, { message: "Mật khẩu phải từ 6 ký tự" }),

  name: z.string().min(1, { message: "Tên bắt buộc" }),

  role: z.enum(UserRole).optional(),

  companyId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
      message: "CompanyID không hợp lệ",
    })
    .optional(),
});

export const UpdateUserStatusSchema = z.object({
  isBanned: z.boolean({ error: "Trạng thái cấm phải là true/false" }),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Mật khẩu hiện tại bắt buộc" }),
    newPassword: passwordStrongSchema,
    confirmNewPassword: z
      .string()
      .min(1, { message: "Xác nhận mật khẩu bắt buộc" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

export const CreateCompanyAdminSchema = z.object({
  name: z.string().min(1),

  email: z.email(),

  phone: z.string().regex(AUTH_CONSTANTS.VN_PHONE_REGEX),
  companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),
});
