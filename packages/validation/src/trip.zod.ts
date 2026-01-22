import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

// Reusable sub-schema
const TripStopSchema = z.object({
  locationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
    message: "Location ID invalid",
  }),

  expectedArrivalTime: z.string().datetime(),
  expectedDepartureTime: z.string().datetime().optional(),
});

export const CreateTripSchema = z
  .object({
    companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
      message: "Company ID invalid",
    }),
    vehicleId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
      message: "Vehicle ID invalid",
    }),

    route: z.object({
      fromLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
        message: "From Location invalid",
      }),
      toLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
        message: "To Location invalid",
      }),
      stops: z.array(TripStopSchema).optional(),
    }),

    departureTime: z
      .string()
      .datetime({ message: "Thời gian khởi hành không hợp lệ" }),
    expectedArrivalTime: z
      .string()
      .datetime({ message: "Thời gian đến không hợp lệ" }),

    price: z.coerce.number().min(0),
    isRecurrenceTemplate: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const start = new Date(data.departureTime);
      const end = new Date(data.expectedArrivalTime);
      return start < end;
    },
    {
      message: "Thời gian khởi hành phải trước thời gian dự kiến đến",
      path: ["expectedArrivalTime"],
    },
  );

export const SearchTripQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date format YYYY-MM-DD" }),
  passengers: z.coerce.number().min(1).default(1),
});
