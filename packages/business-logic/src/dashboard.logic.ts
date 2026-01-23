import { ChartDataPoint } from "@obtp/shared-types";
import dayjs from "dayjs";

/**
 * Tính ngày bắt đầu dựa trên Period Option
 * (Pure Logic wrapper for dayjs)
 */
export function calculateDateRange(periodStr: string): Date {
  const days = parseInt(periodStr.replace("d", ""), 10) || 30; // default 30
  return dayjs().subtract(days, "day").startOf("day").toDate();
}

/**
 * Lấp đầy các ngày còn thiếu trong chuỗi dữ liệu biểu đồ bằng giá trị 0
 * Input: [ {date: '2024-01-01', val: 100}, {date: '2024-01-03', val: 50} ]
 * Output: Full range 01 -> 03 (có thêm 02 val=0)
 */
export function fillMissingChartDates(
  rawData: ChartDataPoint[],
  startDate: Date,
  endDate: Date = new Date(),
): ChartDataPoint[] {
  const filledData: ChartDataPoint[] = [];
  const rawMap = new Map(rawData.map((d) => [d.date, d]));

  const currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);

  // Iterate from Start to End
  for (
    let d = currentDate;
    d.isBefore(lastDate) || d.isSame(lastDate, "day");
    d = d.add(1, "day")
  ) {
    const dateStr = d.format("YYYY-MM-DD");
    if (rawMap.has(dateStr)) {
      filledData.push(rawMap.get(dateStr)!);
    } else {
      filledData.push({
        date: dateStr,
        revenue: 0,
        bookings: 0,
      });
    }
  }

  return filledData;
}
