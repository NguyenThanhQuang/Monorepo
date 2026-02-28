import { useEffect, useMemo, useState } from "react";
import { revenueApi } from "@obtp/api-client";

// Keep the local type minimal and flexible to avoid coupling to api-client internals.
export type RevenueStats = {
  companyName: string;
  totalRevenue: number;
  totalBookings: number;
};

function normalizeRevenueResponse(res: any): RevenueStats[] {
  // api-client may already unwrap "data".
  if (Array.isArray(res)) return res as RevenueStats[];
  if (res && Array.isArray(res.data)) return res.data as RevenueStats[];
  if (res && res.data && Array.isArray(res.data.data)) return res.data.data as RevenueStats[];
  return [];
}

export function RevenueDashboard() {
  const [data, setData] = useState<RevenueStats[]>([]);
  const [month, setMonth] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await revenueApi.getRevenue(month);
      setData(normalizeRevenueResponse(res));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể tải dữ liệu doanh thu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "đ";

  const empty = useMemo(() => !loading && !error && data.length === 0, [loading, error, data.length]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Thống kê doanh thu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Doanh thu theo nhà xe</p>
        </div>

        <select
          className="border p-2 rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={month ?? ""}
          onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Tất cả thời gian</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr className="border-b dark:border-gray-700">
              <th className="p-4 text-left">Nhà xe</th>
              <th className="p-4 text-left">Số booking</th>
              <th className="p-4 text-left">Doanh thu</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-300">
                  Loading...
                </td>
              </tr>
            )}

            {empty && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-500 dark:text-gray-300">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}

            {!loading && data.map((item) => (
              <tr key={item.companyName} className="border-b dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-white/5">
                <td className="p-4 font-medium dark:text-white">{item.companyName}</td>
                <td className="p-4 dark:text-white">{item.totalBookings}</td>
                <td className="p-4 font-semibold text-green-600">{formatCurrency(item.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
