import { useEffect, useState } from "react";
import { BarChart3, Calendar, LogOut } from "lucide-react";
import { revenueApi } from "@obtp/api-client";

interface RevenueStats {
  companyName: string;
  totalRevenue: number;
  totalBookings: number;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<RevenueStats[]>([]);
  const [month, setMonth] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      const res = await revenueApi.getRevenue(month);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [month]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v) + "đ";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-slate-700 to-slate-600 text-white shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-white/20">
          System Admin
        </div>

        <nav className="p-4 space-y-2">

          <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl">
            <BarChart3 size={18} />
            Doanh thu
          </div>

        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center gap-2 w-full p-3 bg-white/10 rounded-xl hover:bg-white/20">
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 shadow p-6 flex justify-between">
          <h1 className="text-2xl font-semibold dark:text-white">
            Thống kê doanh thu
          </h1>

          {/* FILTER MONTH */}
          <div className="flex items-center gap-2">
            <Calendar size={18} />

            <select
              className="border rounded-xl p-2 dark:bg-gray-700"
              onChange={(e) =>
                setMonth(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">Tất cả thời gian</option>

              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6">

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">

            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-4 text-left">Nhà xe</th>
                  <th className="p-4 text-left">Số booking</th>
                  <th className="p-4 text-left">Doanh thu</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading &&
                  data.map((item) => (
                    <tr
                      key={item.companyName}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="p-4">{item.companyName}</td>

                      <td className="p-4">
                        {item.totalBookings}
                      </td>

                      <td className="p-4 font-semibold text-green-600">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}

              </tbody>
            </table>

          </div>

        </main>

      </div>
    </div>
  );
}
