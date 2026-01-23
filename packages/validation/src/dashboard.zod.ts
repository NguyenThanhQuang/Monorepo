import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { ReportPeriod } from "@obtp/shared-types";
import { z } from "zod";

export const FinanceReportQuerySchema = z
  .object({
    period: z.nativeEnum(ReportPeriod).optional(),
    startDate: z.string().datetime().optional(), // Or regex YYYY-MM-DD
    endDate: z.string().datetime().optional(),
    companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID).optional(),
  })
  .refine(
    (data) => {
      // Custom check: Nếu có StartDate phải có EndDate hoặc ngược lại (optional strictness)
      if (
        (data.startDate && !data.endDate) ||
        (!data.startDate && data.endDate)
      )
        return false;
      return true;
    },
    { message: "Must provide both StartDate and EndDate" },
  );
