import { ChartDataPoint, RevenueChartData } from "@obtp/shared-types";
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

/**
 * Group dữ liệu biểu đồ theo tháng (Logic gốc của bạn)
 */
export function groupChartDataByMonth(
  data: RevenueChartData[],
): { month: string; revenue: number; bookings: number }[] {
  const monthMap = new Map<string, { revenue: number; bookings: number }>();

  data.forEach((item) => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.revenue += item.revenue;
      existing.bookings += item.bookings;
    } else {
      monthMap.set(monthKey, {
        revenue: item.revenue,
        bookings: item.bookings,
      });
    }
  });

  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({
      month: key,
      revenue: value.revenue,
      bookings: value.bookings,
    }));
}

/**
 * Lấy params tháng hiện tại
 */
export function getCurrentMonthParams() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Format string date sang text hiển thị "Tháng X/YYYY"
 */
export function formatMonthFromDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}
