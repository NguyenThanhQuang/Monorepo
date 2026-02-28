import type { DashboardData } from "../api/useDashboardData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

export function RevenueChart({
  data,
}: {
  data: DashboardData["monthlyRevenue"];
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="obtp-card obtp-card-strong p-6 mb-6">
      <h3 className="text-xl font-bold mb-6">Doanh thu 6 tháng gần nhất</h3>
      <div className="h-64 relative flex items-end justify-around px-2">
        {data.map((item, index) => {
          const heightPercent = (item.revenue / maxRevenue) * 100;
          const [year, month] = item.month.split("-");
          return (
            <div
              key={index}
              className="flex flex-col items-center group w-12 sm:w-16"
            >
              <div className="relative w-full h-48 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-teal-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                      {formatCurrency(item.revenue)}
                      <br />
                      <span className="text-slate-300">{item.bookings} vé</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs font-medium text-slate-500">
                {month}/{year.slice(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
