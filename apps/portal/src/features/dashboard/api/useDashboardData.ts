import { api } from "@obtp/api-client";
import { BookingStatus, type Booking } from "@obtp/shared-types";
import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  stats: {
    totalRevenue: number;
    currentMonthRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageTicketPrice: number;
  };
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
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

      bookings.forEach((b) => {
        const date = new Date(b.createdAt);
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
        } else if (b.status === BookingStatus.CANCELLED) {
          cancelledBookings++;
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

      const averageTicketPrice =
        completedBookings > 0 ? totalRevenue / completedBookings : 0;

      const monthlyDataMap: Record<
        string,
        { month: string; revenue: number; bookings: number }
      > = {};
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyDataMap[key] = { month: key, revenue: 0, bookings: 0 };
      }

      bookings.forEach((b) => {
        const date = new Date(b.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyDataMap[key]) {
          if (b.status === BookingStatus.CONFIRMED) {
            monthlyDataMap[key].revenue += b.totalAmount;
          }
          monthlyDataMap[key].bookings += 1;
        }
      });

      const recentBookings = [...bookings]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      return {
        stats: {
          totalRevenue,
          currentMonthRevenue,
          revenueGrowth,
          totalBookings: bookings.length,
          completedBookings,
          cancelledBookings,
          averageTicketPrice,
        },
        monthlyRevenue: Object.values(monthlyDataMap),
        recentBookings,
        rawBookings: bookings,
      };
    },
  });
};
