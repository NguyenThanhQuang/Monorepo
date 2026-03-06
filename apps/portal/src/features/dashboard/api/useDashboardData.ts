import { api } from "@obtp/api-client";
import {
  calculateCompanyNetRevenue,
  calculatePlatformCommission,
} from "@obtp/business-logic";
import { BookingStatus, type Booking } from "@obtp/shared-types";
import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  stats: {
    totalRevenue: number;
    commissionFee: number;
    netProfit: number;
    currentMonthRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
  monthlyRevenue: {
    month: string;
    revenue: number;
    netRevenue: number;
    bookings: number;
  }[];
  recentBookings: Booking[];
  rawBookings: Booking[];
}

export const useDashboardData = () => {
  return useQuery<Booking[], Error, DashboardData>({
    queryKey: ["dashboard-bookings"],
    queryFn: async () => {
      return await api.bookings.getCompanyBookings();
    },
    select: (bookings) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthYear =
        currentMonth === 0 ? currentYear - 1 : currentYear;

      let totalRevenue = 0;
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      let completedBookings = 0;
      let cancelledBookings = 0;

      const monthlyDataMap: Record<
        string,
        { month: string; revenue: number; netRevenue: number; bookings: number }
      > = {};
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyDataMap[key] = {
          month: key,
          revenue: 0,
          netRevenue: 0,
          bookings: 0,
        };
      }

      bookings.forEach((b) => {
        const date = new Date(b.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (b.status === BookingStatus.CONFIRMED) {
          totalRevenue += b.totalAmount;
          completedBookings++;

          if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          ) {
            currentMonthRevenue += b.totalAmount;
          } else if (
            date.getMonth() === previousMonth &&
            date.getFullYear() === previousMonthYear
          ) {
            previousMonthRevenue += b.totalAmount;
          }

          if (monthlyDataMap[key]) {
            monthlyDataMap[key].revenue += b.totalAmount;
            monthlyDataMap[key].netRevenue += calculateCompanyNetRevenue(
              b.totalAmount,
            );
          }
        } else if (b.status === BookingStatus.CANCELLED) {
          cancelledBookings++;
        }

        if (monthlyDataMap[key]) {
          monthlyDataMap[key].bookings += 1;
        }
      });

      const revenueGrowth =
        previousMonthRevenue > 0
          ? ((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
            100
          : currentMonthRevenue > 0
            ? 100
            : 0;

      const commissionFee = calculatePlatformCommission(totalRevenue);
      const netProfit = calculateCompanyNetRevenue(totalRevenue);

      const recentBookings = [...bookings]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      return {
        stats: {
          totalRevenue,
          commissionFee,
          netProfit,
          currentMonthRevenue,
          revenueGrowth,
          totalBookings: bookings.length,
          completedBookings,
          cancelledBookings,
        },
        monthlyRevenue: Object.values(monthlyDataMap),
        recentBookings,
        rawBookings: bookings,
      };
    },
  });
};
