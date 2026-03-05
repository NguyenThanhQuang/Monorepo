import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

export const CreatePaymentLinkSchema = z.object({
  bookingId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Booking ID invalid"),
});


const WebhookDataSchema = z.object({
  orderCode: z.number(),
  amount: z.number(),
  description: z.string(),
  accountNumber: z.string(),
  reference: z.string(),
  transactionDateTime: z.string(),
  currency: z.string(),
  paymentLinkId: z.string(),
  code: z.string(),
  desc: z.string(),

  counterAccountBankName: z.string().optional().nullable(),
  counterAccountName: z.string().optional().nullable(),
  counterAccountNumber: z.string().optional().nullable(),
  virtualAccountName: z.string().optional().nullable(),
  virtualAccountNumber: z.string().optional().nullable(),
});

export const PayOSWebhookSchema = z.object({
  code: z.string(),
  desc: z.string(),
  success: z.boolean(),
  data: WebhookDataSchema,
  signature: z.string().min(1),
});
