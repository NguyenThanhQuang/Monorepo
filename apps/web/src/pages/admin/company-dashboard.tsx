import {
  Bus,
  Route,
  Users,
  DollarSign,
  FileText,
  Download,
} from 'lucide-react';
import { useCompanyDashboardLogic } from '../../hooks/Logic/company-dashboard.logic';
import { useLanguage } from '../../contexts/LanguageContext';

export function CompanyDashboard() {
  const { t } = useLanguage();
  const {
    company,
    stats,
    recentTrips,
    showReportModal,
    setShowReportModal,
  } = useCompanyDashboardLogic();

  const statCards = [
    { label: t('totalVehicles'), value: stats.totalVehicles, icon: Bus },
    { label: t('todayTrips'), value: stats.todayTrips, icon: Route },
    { label: t('totalPassengers'), value: stats.totalPassengers, icon: Users },
    {
      label: t('monthlyRevenue'),
      value: `${stats.monthlyRevenue.toLocaleString()}₫`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">
              {t('companyDashboard')}
            </h1>
            <p className="text-gray-500">
              {company?.name}
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <FileText size={18} />
            {t('report')}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6"
              >
                <Icon className="mb-2 text-blue-600" />
                <div className="text-2xl font-semibold">
                  {s.value}
                </div>
                <div className="text-gray-500">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Trips */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">
              {t('recentTrips')}
            </h3>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-sm">
              <tr>
                <th className="px-6 py-3">{t('route')}</th>
                <th className="px-6 py-3">{t('departureTime')}</th>
                <th className="px-6 py-3">{t('vehicle')}</th>
                <th className="px-6 py-3">{t('passengers')}</th>
                <th className="px-6 py-3">{t('status')}</th>
              </tr>
            </thead>

            <tbody>
              {recentTrips.map(trip => (
                <tr key={trip.id} className="border-t">
                  <td className="px-6 py-3">
                    {/* ✅ FIX CHÍNH Ở ĐÂY */}
                    {trip.route.from?.name ?? '—'} →{' '}
                    {trip.route.to?.name ?? '—'}
                  </td>

                  <td className="px-6 py-3">
                    {new Date(trip.departureTime).toLocaleString()}
                  </td>

                  <td className="px-6 py-3">
                    {trip.vehicle?.vehicleNumber ?? '—'}
                  </td>

                  <td className="px-6 py-3">
                    {trip.totalSeats - trip.availableSeatsCount}/
                    {trip.totalSeats}
                  </td>

                  <td className="px-6 py-3">
                    {trip.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    {showReportModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowReportModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Xuất Báo Cáo</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group">
                  <span className="text-gray-900 dark:text-white">Báo cáo doanh thu</span>
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group">
                  <span className="text-gray-900 dark:text-white">Báo cáo chuyến đi</span>
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group">
                  <span className="text-gray-900 dark:text-white">Báo cáo hành khách</span>
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group">
                  <span className="text-gray-900 dark:text-white">Báo cáo phương tiện</span>
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-full mt-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
