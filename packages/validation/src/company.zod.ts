import { CompanyStatus } from '@obtp/shared-types';
import { z } from 'zod';

// Regex chuẩn SĐT Việt Nam: 10 số, bắt đầu bằng các đầu số nhà mạng VN
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;
const COMPANY_CODE_REGEX = /^[a-zA-Z0-9_]+$/;

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Tên nhà xe không được để trống').max(100).trim(),

  code: z
    .string()
    .min(2, 'Mã nhà xe quá ngắn')
    .max(20, 'Mã nhà xe quá dài')
    .regex(COMPANY_CODE_REGEX, 'Mã nhà xe chỉ chứa chữ cái, số và (_)')
    .transform((val) => val.toUpperCase()),

  address: z.string().max(255).optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Số điện thoại nhà xe không hợp lệ (10 số)')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email({ message: 'Email công ty không hợp lệ' })
    .max(100, { message: 'Email không được quá 100 ký tự' })
    .optional()
    .or(z.literal('')),

  description: z.string().max(1000).optional(),

  logoUrl: z
    .string()
    .url({ message: 'Logo phải là URL hợp lệ' })
    .optional()
    .or(z.literal('')),

  status: z.nativeEnum(CompanyStatus).optional().default(CompanyStatus.ACTIVE),

  adminName: z.string().min(1, { message: 'Tên quản trị viên bắt buộc' }),
  adminEmail: z.string().email({ message: 'Email quản trị viên không hợp lệ' }),
  adminPhone: z
    .string()
    .regex(PHONE_REGEX, {
      message: 'SĐT quản trị viên không đúng định dạng VN (10 số)',
    }),
});

export const updateCompanySchema = createCompanySchema
  .omit({
    code: true,
    adminName: true,
    adminEmail: true,
    adminPhone: true,
  })
  .partial()
  .refine(
    (data) => {
      // Nếu có email thì không được để trống
      if (data.email !== undefined) {
        return data.email && data.email.trim() !== '';
      }
      return true;
    },
    {
      message: 'Email công ty không được để trống',
      path: ['email'],
    }
  )
  .refine(
    (data) => {
      // Nếu có phone thì không được để trống
      if (data.phone !== undefined) {
        return data.phone && data.phone.trim() !== '';
      }
      return true;
    },
    {
      message: 'Số điện thoại công ty không được để trống',
      path: ['phone'],
    }
  );