import { useDashboardData } from "../api/useDashboardData";
import { StatsCards } from "../components/StatsCards";
import { RevenueChart } from "../components/RevenueChart";
import { RecentBookingsTable } from "../components/RecentBookingsTable";
import { exportBookingsToExcel } from "../utils/exportExcel";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading, isError } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Có lỗi xảy ra khi tải dữ liệu.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black">Dashboard Nhà Xe</h1>
          <p className="text-slate-500 mt-1">Xin chào, {user?.name}</p>
        </div>

        <Button onClick={() => exportBookingsToExcel(data.rawBookings)}>
          <Download size={16} className="mr-2" /> Xuất báo cáo Excel
        </Button>
      </div>

      <StatsCards stats={data.stats} />
      <RevenueChart data={data.monthlyRevenue} />
      <RecentBookingsTable bookings={data.recentBookings} />
    </div>
  );
}
