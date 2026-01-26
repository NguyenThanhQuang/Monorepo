'use client';

import { useCompanyDashboardLogic } from "../../hooks/Logic/company-dashboard.logic";


export default function CompanyDashboardPage() {
  const { stats, trips, loading } = useCompanyDashboardLogic();

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="border rounded-xl p-4">
            <div className={`text-sm ${s.color}`}>{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Tuyến</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Giờ</th>
              <th className="p-3">Xe</th>
              <th className="p-3">Ghế</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3">{t.routeName}</td>
                <td className="p-3 text-center">{t.departureDate}</td>
                <td className="p-3 text-center">{t.departureTime}</td>
                <td className="p-3 text-center">{t.vehicleNumber}</td>
                <td className="p-3 text-center">
                  {t.bookedSeats}/{t.totalSeats}
                </td>
                <td className="p-3 text-center">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
