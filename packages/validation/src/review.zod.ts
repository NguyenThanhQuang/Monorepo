import { AUTH_CONSTANTS, BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

// Constant constants logic injection
// Max comment length
const MAX_COMMENT_LENGTH = 2000;

export const CreateReviewSchema = z.object({
  tripId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Invalid Trip ID"),
  bookingId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Invalid Booking ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(MAX_COMMENT_LENGTH).optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export const CreateGuestReviewSchema = CreateReviewSchema.extend({
  contactPhone: z
    .string()
    .regex(AUTH_CONSTANTS.VN_PHONE_REGEX, "SĐT không hợp lệ"),
});

export const UpdateUserReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(MAX_COMMENT_LENGTH).optional(),
});

export const UpdateVisibilitySchema = z.object({
  isVisible: z.boolean(),
});

export const ReviewQuerySchema = z.object({
  companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID).optional(),
  tripId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID).optional(),
  userId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});
