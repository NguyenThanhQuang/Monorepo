import { BUSINESS_CONSTANTS } from "@obtp/business-logic";
import { z } from "zod";

export const FinanceReportQuerySchema = z
  .object({
    // Nới lỏng thành string để chấp nhận 'all', '30d', '12m', v.v.
    period: z.string().optional(),
    startDate: z.string().optional(), 
    endDate: z.string().optional(),
    companyId: z.string().regex(BUSINESS_CONSTANTS.REGEX.MONGO_ID).optional(),
  })
  .refine(
    (data) => {
      // Bắt buộc: Có ngày bắt đầu thì phải có ngày kết thúc
      if (
        (data.startDate && !data.endDate) ||
        (!data.startDate && data.endDate)
      )
        return false;
      return true;
    },
    { message: "Phải cung cấp cả Ngày bắt đầu và Ngày kết thúc" },
  );