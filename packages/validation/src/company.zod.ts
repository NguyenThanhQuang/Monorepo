import { CompanyStatus } from "@obtp/shared-types";
import { z } from "zod";

// Regex check mã nhà xe: Chỉ chữ hoa, số và gạch dưới (Giống code cũ)
const COMPANY_CODE_REGEX = /^[A-Z0-9_]+$/;

// Regex cơ bản cho SDT VN (Điều chỉnh tùy nhu cầu chặt chẽ)
const PHONE_REGEX = /((09|03|07|08|05)+([0-9]{8})\b)/g;

export const createCompanySchema = z.object({
  // Company Info
  name: z.string().min(1, "Tên nhà xe không được để trống").max(100).trim(),

  code: z
    .string()
    .min(2, "Mã nhà xe quá ngắn")
    .max(20, "Mã nhà xe quá dài")
    .regex(COMPANY_CODE_REGEX, "Mã nhà xe chỉ chứa chữ hoa, số và (_)")
    .transform((val) => val.toUpperCase()), // Tự động uppercase khi validate

  address: z.string().max(255).optional(),

  phone: z.string().max(20).optional(),

  email: z
    .email({ message: "Email công ty không hợp lệ" })
    .max(100, { message: "Email không được quá 100 ký tự" })
    .optional()
    .or(z.literal("")),

  description: z.string().max(1000).optional(),

  logoUrl: z
    .url({ message: "Logo phải là URL hợp lệ" })
    .optional()
    .or(z.literal("")),

  status: z.enum(CompanyStatus).optional().default(CompanyStatus.ACTIVE),

  adminName: z.string().min(1, { message: "Tên quản trị viên bắt buộc" }),

  adminEmail: z.email({ message: "Email quản trị viên không hợp lệ" }),

  adminPhone: z
    .string()
    .regex(PHONE_REGEX, {
      message: "SĐT quản trị viên không đúng định dạng VN",
    })
    .or(
      z
        .string()
        .min(10, { message: "SĐT phải từ 10 số" })
        .max(11, { message: "SĐT tối đa 11 số" }),
    ),
});

export const updateCompanySchema = createCompanySchema
  .omit({
    adminName: true,
    adminEmail: true,
    adminPhone: true,
  }) // Không update admin ở endpoint này
  .partial(); // Tất cả thành optional
