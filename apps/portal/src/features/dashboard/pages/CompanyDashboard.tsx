// src/features/dashboard/pages/CompanyDashboard.tsx
import { FileText, TrendingUp, Car, Users, Route } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export function CompanyDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Nhà Xe
          </h1>
          <p className="text-gray-500">
            Company ID: {user?.companyId || 'N/A'}
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 transition">
          <FileText className="w-4 h-4" />
          Báo cáo
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng số xe', value: '0', color: 'from-blue-500 to-blue-600', icon: <Car /> },
          { label: 'Xe đang hoạt động', value: '0', color: 'from-green-500 to-green-600', icon: <Car /> },
          { label: 'Xe bảo trì', value: '0', color: 'from-yellow-500 to-yellow-600', icon: <Car /> },
          { label: 'Tổng số ghế', value: '0', color: 'from-purple-500 to-purple-600', icon: <Users /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 flex items-center justify-center`}>
              <div className="w-6 h-6 text-white">
                {stat.icon}
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Doanh thu hàng tháng
          </h3>
          <select className="px-3 py-1 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <option>Tháng này</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
        </div>

        <div className="h-64 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Biểu đồ doanh thu sẽ hiển thị tại đây</p>
          </div>
        </div>
      </div>

      {/* ================= RECENT ACTIVITIES ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hoạt động gần đây
          </h3>
        </div>

        <div className="p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Route className="w-12 h-12 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Chưa có hoạt động nào
          </h4>
          <p className="text-gray-500 max-w-md mx-auto">
            Các hoạt động và chuyến đi của bạn sẽ hiển thị tại đây khi có dữ liệu
          </p>
        </div>
      </div>
    </div>
  );
}