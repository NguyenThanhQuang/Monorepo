import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

// Reusable sub-schema
const TripStopSchema = z.object({
  locationId: z
    .string()
    .regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, "Location ID invalid"),
  expectedArrivalTime: z.string().datetime(),
  expectedDepartureTime: z.string().datetime().optional(),
});

export const CreateTripSchema = z
  .object({
    companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),
    vehicleId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),

    route: z.object({
      fromLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),
      toLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID),
      stops: z.array(TripStopSchema).optional(),
    }),

    departureTime: z.string().datetime(),
    expectedArrivalTime: z.string().datetime(),

    price: z.coerce.number().min(0), // Coerce để nhận cả string '50000'
    isRecurrenceTemplate: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // Custom validate time logic at Schema level
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
  from: z.string().min(1), // Từ khóa tỉnh/thành
  to: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format YYYY-MM-DD"),
  passengers: z.coerce.number().min(1).default(1),
});
