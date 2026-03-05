import { AUTH_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

export const CreateDriverSchema = z.object({
  name: z.string().min(1, "Tên tài xế không được để trống"),
  phone: z.string().regex(AUTH_CONSTANTS.VN_PHONE_REGEX, "SĐT không hợp lệ"),
  licenseNumber: z.string().min(1, "Bằng lái xe bắt buộc"),
  idCardNumber: z.string().min(9, "CCCD/CMND không hợp lệ"),
  experienceYears: z.coerce.number().min(0).optional().default(0),
});

export const UpdateDriverSchema = CreateDriverSchema.partial().extend({
  status: z.enum(["active", "inactive"]).optional(),
});
