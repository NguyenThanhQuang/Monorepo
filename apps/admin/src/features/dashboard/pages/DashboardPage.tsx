// src/features/admin/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  Bus,
  Ticket,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { adminApi, type DashboardStats, type RecentActivity } from "@obtp/api-client";

export function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gọi API song song
      const [statsData, activitiesData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivities(10)
      ]);

      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'booking':
        return <Ticket className="w-4 h-4 text-blue-500" />;
      case 'company':
        return <Building2 className="w-4 h-4 text-green-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không thể tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tổng quan hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Chào mừng trở lại, {user?.name || 'Admin'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className={`flex items-center text-sm font-medium ${
              stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.revenueGrowth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.revenueGrowth)}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-2">So với tháng trước</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`flex items-center text-sm font-medium ${
              stats.bookingGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.bookingGrowth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.bookingGrowth)}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng số vé</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalBookings)}
          </p>
          <p className="text-xs text-gray-400 mt-2">So với tháng trước</p>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className={`flex items-center text-sm font-medium ${
              stats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.userGrowth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.userGrowth)}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Người dùng</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalUsers)}
          </p>
          <p className="text-xs text-gray-400 mt-2">So với tháng trước</p>
        </div>

        {/* Companies & Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nhà xe</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalCompanies}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Xe khách</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalVehicles)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chuyến đi</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalTrips)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hoạt động gần đây
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      +{formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Chưa có hoạt động nào
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Thống kê nhanh
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Tỷ lệ chuyến đầy</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.totalTrips > 0 
                    ? `${Math.round((stats.totalBookings / (stats.totalTrips * 30)) * 100)}%` 
                    : '0%'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, (stats.totalBookings / (stats.totalTrips * 30)) * 100)}%` }} 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Tỷ lệ hủy vé</span>
                <span className="font-medium text-gray-900 dark:text-white">5.2%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '5.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Đánh giá trung bình</span>
                <span className="font-medium text-gray-900 dark:text-white">4.6/5</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Nhà xe hoạt động</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(stats.totalCompanies * 0.85)}/{stats.totalCompanies}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Xe đang chạy</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(stats.totalVehicles * 0.75).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Chuyến hôm nay</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(stats.totalTrips / 30)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}