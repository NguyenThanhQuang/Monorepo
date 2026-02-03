import {
  Bus,
  Route,
  Users,
  DollarSign,
  FileText,
  Download,
} from 'lucide-react';
import { useCompanyDashboardLogic } from '../hooks/Logic/company-dashboard.logic';
import { useLanguage } from '../contexts/LanguageContext';
import type { Page } from '../App';
import { CompanyLayout } from '../components/layout/CompanyLayout';

interface Props {
  onNavigate: (page: Page) => void;
}

export function CompanyDashboard({ onNavigate }: Props) {
  const { t } = useLanguage();
  const {
    company,
    stats,
    recentTrips,
    showReportModal,
    setShowReportModal,
  } = useCompanyDashboardLogic();

  const statCards = [
    { label: 'Tổng số xe', value: stats.totalVehicles, icon: Bus },
    { label: 'Chuyến hôm nay', value: stats.todayTrips, icon: Route },
    { label: 'Tổng hành khách', value: stats.totalPassengers, icon: Users },
    {
      label: 'Doanh thu tháng',
      value: `${stats.monthlyRevenue.toLocaleString()}₫`,
      icon: DollarSign,
    },
  ];

  return (
    <CompanyLayout
      onNavigate={onNavigate}
      active="company-dashboard"
    >
      {/* ===== HEADER ===== */}
      <div className="px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Dashboard Nhà Xe
          </h1>
          <p className="text-gray-400">
            {company?.name}
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600"
        >
          <FileText size={18} />
          Báo cáo
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-4 gap-6 px-8">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-[#0F172A] rounded-2xl p-6"
            >
              <Icon className="mb-2 text-blue-500" />
              <div className="text-2xl font-semibold">
                {s.value}
              </div>
              <div className="text-gray-400 text-sm">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== TABLE ===== */}
      <div className="px-8 mt-8">
        <h3 className="mb-4 font-semibold">
          Chuyến Đi Gần Đây
        </h3>

        <div className="bg-[#0F172A] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-sm">
              <tr>
                <th className="p-4">Tuyến</th>
                <th>Thời gian</th>
                <th>Xe</th>
                <th>Đã đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map(trip => (
                <tr
                  key={trip.id}
                  className="border-t border-white/10"
                >
                  <td className="p-4">
                    {trip.route.from?.name} →{' '}
                    {trip.route.to?.name}
                  </td>
                  <td>
                    {new Date(trip.departureTime).toLocaleString()}
                  </td>
                  <td>{trip.vehicle?.vehicleNumber}</td>
                  <td>
                    {trip.totalSeats -
                      trip.availableSeatsCount}
                    /{trip.totalSeats}
                  </td>
                  <td className="text-green-400">
                    {trip.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showReportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowReportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-[#0F172A] rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl mb-4">
                Xuất Báo Cáo
              </h3>

              <button className="w-full py-3 mb-2 bg-white/10 rounded-xl">
                Báo cáo doanh thu <Download className="inline ml-2" />
              </button>

              <button
                onClick={() => setShowReportModal(false)}
                className="w-full py-3 bg-blue-600 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </CompanyLayout>
  );
}
