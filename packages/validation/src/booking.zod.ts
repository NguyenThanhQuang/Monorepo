import { AUTH_CONSTANTS, BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

const PassengerInputSchema = z.object({
  name: z.string().min(1, "Tên hành khách không được để trống"),
  phone: z
    .string()
    .regex(
      AUTH_CONSTANTS.VN_PHONE_REGEX,
      "Số điện thoại hành khách không hợp lệ",
    ),
  seatNumber: z.string().min(1),
});

export const CreateBookingSchema = z.object({
  tripId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Trip ID invalid"),
  passengers: z
    .array(PassengerInputSchema)
    .min(1, "Phải có ít nhất 1 hành khách")
    .max(
      BUSINESS_CONSTANTS.BOOKING.MAX_SEATS_PER_BOOKING,
      `Tối đa ${BUSINESS_CONSTANTS.BOOKING.MAX_SEATS_PER_BOOKING} ghế một lần`,
    ),

  contactName: z.string().min(1, "Tên liên hệ bắt buộc"),
  contactPhone: z
    .string()
    .regex(AUTH_CONSTANTS.VN_PHONE_REGEX, "Số điện thoại liên hệ không hợp lệ"),
  contactEmail: z.email().optional().or(z.literal("")),
});

export const LookupBookingSchema = z.object({
  identifier: z.string().min(1, "Mã tra cứu không được trống"),
  contactPhone: z
    .string()
    .regex(AUTH_CONSTANTS.VN_PHONE_REGEX, "Số điện thoại không hợp lệ"),
});

export const ConfirmBookingSchema = z.object({
  paidAmount: z.number().min(0),
  paymentMethod: z.string().min(1),
  transactionDateTime: z.string(),
});
