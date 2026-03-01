import { DollarSign, Wallet, Percent, FileText } from "lucide-react";
import type { DashboardData } from "../api/useDashboardData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

export function StatsCards({ stats }: { stats: DashboardData["stats"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Thẻ 1: Tổng Doanh thu Gộp */}
      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">
            TỔNG DOANH THU (GROSS)
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
          {formatCurrency(stats.totalRevenue)}
        </div>
        <div className="text-xs text-slate-400 mt-2">
          Ghi nhận từ {stats.completedBookings} vé đã thanh toán
        </div>
      </div>

      {/* Thẻ 2: Phí nền tảng */}
      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition border-l-4 border-l-red-500">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">
            PHÍ NỀN TẢNG (15%)
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <Percent size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-red-600 mb-1">
          -{formatCurrency(stats.commissionFee)}
        </div>
        <div className="text-xs text-slate-400 mt-2">
          Thanh toán cho OBTP System
        </div>
      </div>

      {/* Thẻ 3: Doanh thu Thực nhận */}
      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition border-l-4 border-l-green-500 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="text-sm font-semibold text-green-700 dark:text-green-400">
            THỰC NHẬN (NET PROFIT)
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-500/30">
            <Wallet size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-green-600 dark:text-green-500 mb-1 relative z-10">
          {formatCurrency(stats.netProfit)}
        </div>
        <div className="text-xs font-medium text-green-700/70 dark:text-green-400/70 mt-2 relative z-10">
          Số tiền nhà xe được rút về tài khoản
        </div>
      </div>

      {/* Thẻ 4: Thống kê Vé */}
      <div className="obtp-card obtp-card-strong p-6 flex flex-col hover:shadow-lg transition border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">
            TỔNG SỐ VÉ ĐÃ ĐẶT
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
          {stats.totalBookings}{" "}
          <span className="text-lg font-normal text-slate-400">vé</span>
        </div>
        <div className="flex gap-4 text-xs font-medium mt-2">
          <span className="text-green-600">
            ✓ {stats.completedBookings} thành công
          </span>
          <span className="text-red-600">
            ✗ {stats.cancelledBookings} đã hủy
          </span>
        </div>
      </div>
    </div>
  );
}
