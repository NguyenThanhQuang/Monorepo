import { useNavigate } from "react-router-dom";
import {
  Bus,
  FileText,
  TrendingUp,
  LogOut,
  Home,
  Car,
  Users,
  Route,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Sử dụng useAuth
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Bảng điều khiển', path: '/company/dashboard' },
    { icon: <Car className="w-5 h-5" />, label: 'Quản lý xe', path: '/company/vehicles' },
    { icon: <Users className="w-5 h-5" />, label: 'Tài xế', path: '#', disabled: true },
    { icon: <Route className="w-5 h-5" />, label: 'Chuyến đi', path: '#', disabled: true },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-slate-600 text-white flex flex-col">
        <div className="p-5 border-b border-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-semibold">Company Admin</span>
              <div className="text-sm text-slate-300">
                {user?.email || 'admin@company.com'}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive(item.path)
                  ? 'bg-teal-500 text-white'
                  : item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-slate-500'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-slate-500 transition bg-red-500/20 hover:bg-red-500/30"
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
              Company ID: {user?.companyId || 'N/A'}
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 transition">
            <FileText className="w-4 h-4" />
            Báo cáo
          </button>
        </div>

        {/* ================= STATS PLACEHOLDER ================= */}
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

        {/* ================= CHART PLACEHOLDER ================= */}
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
      </main>
    </div>
  );
}