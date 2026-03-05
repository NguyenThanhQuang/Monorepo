import { LocationType } from "@obtp/shared-types";
import { z } from "zod";

const geoJsonPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]).refine(
    (coords) => {
      const [lon, lat] = coords;
      return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
    },
    {
      message: "Tọa độ không hợp lệ. Kinh độ: -180~180, Vĩ độ: -90~90.",
    },
  ),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, { message: "Tên địa điểm bắt buộc" }).max(200).trim(),
  province: z.string().min(1, { message: "Tỉnh/Thành bắt buộc" }).trim(),
  district: z.string().trim().optional(),
  fullAddress: z
    .string()
    .min(5, { message: "Địa chỉ chi tiết bắt buộc" })
    .trim(),

  location: geoJsonPointSchema,

  type: z.enum(LocationType, {
    error: "Loại địa điểm không hợp lệ.",
  }),

  images: z.array(z.string().url()).optional(),

  isActive: z.boolean().default(true).optional(),
});

export const updateLocationSchema = createLocationSchema.partial();
