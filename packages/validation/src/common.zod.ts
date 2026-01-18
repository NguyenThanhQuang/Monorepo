import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

// Schema validate ObjectId string chuẩn
export const MongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" });

// Schema chuẩn cho Pagination Query
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(BUSINESS_CONSTANTS.SYSTEM.MAX_PAGE_SIZE)
    .default(BUSINESS_CONSTANTS.SYSTEM.DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;
