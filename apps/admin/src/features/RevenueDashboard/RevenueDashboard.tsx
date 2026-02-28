import { revenueApi } from "@obtp/api-client";
import type { RevenueStats } from "@obtp/api-client/src/modules/revenueApi";
import { useEffect, useState } from "react";

export function RevenueDashboard() {
  const [data, setData] = useState<RevenueStats[]>([]);
  const [month, setMonth] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await revenueApi.getRevenue(month);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v) + "đ";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Thống kê doanh thu</h1>

      {/* FILTER MONTH */}
      <div className="mb-6">
        <select
          className="border p-2 rounded-xl"
          onChange={(e) =>
            setMonth(e.target.value ? Number(e.target.value) : undefined)
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

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
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
                <tr key={item.companyName} className="border-b">
                  <td className="p-4">{item.companyName}</td>
                  <td className="p-4">{item.totalBookings}</td>
                  <td className="p-4 font-semibold">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
