// src/features/admin/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Building2, 
  Users, 
  Ticket,
  Calendar,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { adminApi } from "@obtp/api-client";
import type { AdminDashboardStats } from "@obtp/shared-types";

export function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [retryCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // CHỈ gọi API dashboard stats, KHÔNG gọi activities
      const statsData = await adminApi.getDashboardStats();
      console.log('Dashboard stats received:', statsData);
      
      setStats(statsData);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      
      // Xử lý lỗi cụ thể
      if (error?.response?.status === 404) {
        setError('API dashboard chưa được triển khai. Vui lòng kiểm tra lại đường dẫn API.');
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        setError('Bạn không có quyền truy cập dữ liệu này.');
      } else if (error?.response?.status === 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else if (error?.message?.includes('Network Error')) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError(error?.message || 'Không thể tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Helper functions an toàn - kiểm tra undefined
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0đ';
    return adminApi.formatCompactCurrency(amount);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return adminApi.formatNumber(num);
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center max-w-md">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị khi không có dữ liệu
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
            Chào mừng trở lại, {user?.name || 'Admin'}!
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-5 h-5" />
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng số vé</p>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Người dùng</p>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nhà xe</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalCompanies}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Mới hôm nay: {stats.newCompaniesToday}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Chuyến đi đang hoạt động</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.activeTrips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}