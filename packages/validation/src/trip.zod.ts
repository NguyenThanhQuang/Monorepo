import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

const TripStopSchema = z.object({
  locationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
    message: "Địa điểm không hợp lệ",
  }),
  expectedArrivalTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Thời gian đến không hợp lệ",
  }),
  expectedDepartureTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Thời gian đi không hợp lệ",
    })
    .optional(),
});

export const CreateTripSchema = z
  .object({
    companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
      message: "Company ID không hợp lệ",
    }),
    vehicleId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
      message: "Vehicle ID không hợp lệ",
    }),
    route: z.object({
      fromLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
        message: "From Location ID không hợp lệ",
      }),
      toLocationId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
        message: "To Location ID không hợp lệ",
      }),
      stops: z.array(TripStopSchema).optional(),
    }),
    departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Thời gian khởi hành không hợp lệ",
    }),
    expectedArrivalTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Thời gian đến không hợp lệ",
    }),
    price: z.coerce.number().min(0, "Giá vé không thể là số âm"),
    isRecurrenceTemplate: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (!data.departureTime || !data.expectedArrivalTime) {
        return true;
      }
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

export const AssignDriverSchema = z.object({
  driverId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID, {
    message: "Tài xế không hợp lệ",
  }),
});
