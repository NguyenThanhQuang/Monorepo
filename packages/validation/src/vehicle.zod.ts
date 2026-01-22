import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { VehicleStatus } from "@obtp/shared-types";
import { z } from "zod";

// Shared Sub-Schema
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
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase()),
  type: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(VehicleStatus).default(VehicleStatus.ACTIVE).optional(),

  // Cấu hình vật lý
  floors: z.number().int().min(1).max(2).default(1),
  seatRows: z.number().int().min(1).max(50),
  seatColumns: z.number().int().min(1).max(10), // Xe Bus thường max 5-6 cột thôi
  aislePositions: AislePositionSchema,
});

export const UpdateVehicleSchema = z.object({
  // Cho phép update từng phần
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
  aislePositions: AislePositionSchema,
});
