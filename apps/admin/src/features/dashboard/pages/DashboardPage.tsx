import {
  DollarSign,
  Building2,
  Users,
  Ticket,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useAuth } from "@/contexts/AuthContext";

export function AdminDashboard() {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDashboardStats();

  const getErrorMessage = (err: any) => {
    if (err?.response?.status === 404)
      return "API dashboard chưa được triển khai. Vui lòng kiểm tra lại đường dẫn API.";
    if (err?.response?.status === 401 || err?.response?.status === 403)
      return "Bạn không có quyền truy cập dữ liệu này.";
    if (err?.response?.status === 500)
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    if (err?.message?.includes("Network Error"))
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    return err?.message || "Không thể tải dữ liệu";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center max-w-md">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {getErrorMessage(error)}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            {isRefetching ? "Đang thử lại..." : "Thử lại"}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Chào mừng trở lại, {user?.name || "Admin"}!
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Tổng doanh thu
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* Sử dụng compact=true để hiển thị dạng 1.5 tỷ / 500 triệu */}
            {formatCurrency(stats.totalRevenue, true)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Toàn thời gian</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Tổng số vé
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalBookings)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Hôm nay: {formatNumber(stats.todayBookings)}
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Người dùng
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalUsers)}
          </p>
        </div>

        {/* Companies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Nhà xe
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalCompanies)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Mới hôm nay: {formatNumber(stats.newCompaniesToday)}
          </p>
        </div>
      </div>

      {/* Active Trips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chuyến đi đang hoạt động
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.activeTrips)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
