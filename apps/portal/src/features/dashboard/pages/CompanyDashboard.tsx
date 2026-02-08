// src/components/CompanyDashboard.tsx
import { useNavigate } from "react-router-dom";
import {
  Bus,
  FileText,
  TrendingUp,
  LogOut,
} from "lucide-react";
import CompanyVehiclesPage from "../../vehicles/pages/CompanyVehiclesPage";

export function CompanyDashboard() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Nếu đang ở trang quản lý xe, hiển thị trang đó
  if (currentPath.includes('/company/vehicles')) {
    return <CompanyVehiclesPage />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-slate-600 text-white flex flex-col">
        <div className="p-5 border-b border-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">Company</span>
          </div>
          <div className="mt-2 text-sm text-slate-300">
            Xin chào, {user.name || 'Admin'}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => navigate('/company/dashboard')}
            className="w-full text-left px-4 py-2 rounded-xl hover:bg-slate-500 transition"
          >
            Bảng điều khiển
          </button>

          <button
            onClick={() => navigate("/company/vehicles")}
            className="w-full text-left px-4 py-2 rounded-xl hover:bg-slate-500 transition"
          >
            Quản lý xe
          </button>

          <button className="w-full text-left px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
            Tài xế
          </button>

          <button className="w-full text-left px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
            Chuyến đi
          </button>
        </nav>

        <div className="p-4 border-t border-slate-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-500 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Nhà Xe
            </h1>
            <p className="text-gray-500">
              Quản lý công ty {user.companyId || ''}
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white">
            <FileText className="w-4 h-4" />
            Báo cáo
          </button>
        </div>

        {/* ================= STATS PLACEHOLDER ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Tổng số xe', value: '0', color: 'from-blue-500 to-blue-600' },
            { label: 'Xe đang hoạt động', value: '0', color: 'from-green-500 to-green-600' },
            { label: 'Xe bảo trì', value: '0', color: 'from-yellow-500 to-yellow-600' },
            { label: 'Tổng số ghế', value: '0', color: 'from-purple-500 to-purple-600' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 flex items-center justify-center`}>
                <Bus className="w-6 h-6 text-white" />
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

        {/* ================= CHART PLACEHOLDER ================= */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white">
              Doanh thu
            </h3>
          </div>

          <div className="h-64 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 flex items-center justify-center">
            <TrendingUp className="w-16 h-16 text-gray-400" />
          </div>
        </div>

        {/* ================= TABLE PLACEHOLDER ================= */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white">
              Chuyến đi gần đây
            </h3>
          </div>

          <div className="p-10 text-center text-gray-400">
            Chưa có dữ liệu
          </div>
        </div>
      </main>
    </div>
  );
}