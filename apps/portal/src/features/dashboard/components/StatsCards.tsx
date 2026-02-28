import { DollarSign, Calendar, FileText, TrendingUp } from "lucide-react";
import type { DashboardData } from "../api/useDashboardData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

export function StatsCards({ stats }: { stats: DashboardData["stats"] }) {
  const isGrowthPositive = stats.revenueGrowth >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 mb-4 flex items-center justify-center">
          <DollarSign className="text-white" size={24} />
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatCurrency(stats.totalRevenue)}
        </div>
        <div className="text-sm text-slate-500">Tổng doanh thu</div>
      </div>

      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 mb-4 flex items-center justify-center">
          <Calendar className="text-white" size={24} />
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatCurrency(stats.currentMonthRevenue)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Doanh thu tháng này</span>
          <span
            className={`text-sm font-medium ${isGrowthPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isGrowthPositive ? "↑" : "↓"}{" "}
            {Math.abs(stats.revenueGrowth).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 mb-4 flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div className="text-2xl font-bold mb-1">{stats.totalBookings}</div>
        <div className="text-sm text-slate-500 mb-2">Tổng số vé</div>
        <div className="flex gap-4 text-xs">
          <span className="text-green-600">
            ✓ {stats.completedBookings} đã xác nhận
          </span>
          <span className="text-red-600">
            ✗ {stats.cancelledBookings} đã hủy
          </span>
        </div>
      </div>

      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 mb-4 flex items-center justify-center">
          <TrendingUp className="text-white" size={24} />
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatCurrency(stats.averageTicketPrice)}
        </div>
        <div className="text-sm text-slate-500">Giá vé trung bình</div>
      </div>
    </div>
  );
}
