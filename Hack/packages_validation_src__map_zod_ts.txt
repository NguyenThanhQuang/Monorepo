import { z } from "zod";

const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90, "Vĩ độ không hợp lệ"),
  lng: z.number().min(-180).max(180, "Kinh độ không hợp lệ"),
});

export const CalculateRouteSchema = z.object({
  waypoints: z
    .array(GeoPointSchema)
    .min(2, "Cần ít nhất 2 tọa độ (Điểm đi & Điểm đến)"),
});
