import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { SortOrder } from "@obtp/shared-types";
import { z } from "zod";

export const MongoIdSchema = z
  .string()
  .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Invalid MongoDB ObjectId");

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(BUSINESS_CONSTANTS.SYSTEM.MAX_PAGE_SIZE)
    .default(BUSINESS_CONSTANTS.SYSTEM.DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(SortOrder).optional().default(SortOrder.ASC),
});

export const ParamIdSchema = z.object({
  id: MongoIdSchema,
});
