import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { VehicleStatus } from "@obtp/shared-types";
import { z } from "zod";

const BaseAisleSchema = z
  .array(z.number().int().max(10))
  .max(5, "Tối đa 5 lối đi");

const BaseFullRowsSchema = z.array(z.number());

const AislePositionSchema = z
  .array(z.number().int().min(1).max(10))
  .max(5, "Tối đa 5 lối đi")
  .optional()
  .default([]);

export const CreateVehicleSchema = z.object({
  companyId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "CompanyID không hợp lệ"),
  vehicleNumber: z
    .string()
    .min(1, "Biển số xe không được để trống")
    .max(20, "Biển số xe quá dài")
    .transform((v) => v.toUpperCase()),
  type: z.string().min(1, "Vui lòng nhập loại xe hoặc mô tả").max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(VehicleStatus).default(VehicleStatus.ACTIVE).optional(),

  floors: z.number().int().min(1).max(2).default(1),
  seatRows: z.number().int().min(1).max(50),
  seatColumns: z.number().int().min(1).max(10),

  aislePositions: BaseAisleSchema.optional().default([]),
  fullRows: BaseFullRowsSchema.optional().default([]),
});

export const UpdateVehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase())
    .optional(),
  type: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(VehicleStatus).optional(),

  floors: z.number().int().min(1).max(2).optional(),
  seatRows: z.number().int().min(1).max(50).optional(),
  seatColumns: z.number().int().min(1).max(10).optional(),

  aislePositions: BaseAisleSchema.optional(),
  fullRows: BaseFullRowsSchema.optional(),
});
