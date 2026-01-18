import { z } from "zod";

/**
 * Schema validate Mongo ObjectId (string format)
 * Không phụ thuộc vào thư viện mongoose
 */
export const MongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, {
    message: "ID không hợp lệ (Phải là chuỗi 24 ký tự hex)",
  });

/**
 * Schema cho Pagination (Page/Limit)
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
