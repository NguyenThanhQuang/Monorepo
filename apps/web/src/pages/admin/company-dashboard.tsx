import {
  Bus,
  Route,
  Users,
  DollarSign,
  FileText,
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
    { label: t('monthlyRevenue'), value: `${stats.monthlyRevenue}₫`, icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between">
          <div>
            <h1>{t('companyDashboard')}</h1>
            <p>{company?.name}</p>
          </div>
          <button onClick={() => setShowReportModal(true)}>
            <FileText /> {t('report')}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-3xl p-6">
                <Icon />
                <div>{s.value}</div>
                <div>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3>{t('recentTrips')}</h3>
          </div>
          <table className="w-full">
            <tbody>
              {recentTrips.map(trip => (
                <tr key={trip.id}>
                  <td>{trip.route.from} → {trip.route.to}</td>
                  <td>{new Date(trip.departureTime).toLocaleString()}</td>
                  <td>{trip.vehicleId.vehicleNumber}</td>
                  <td>
                    {trip.totalSeats - trip.availableSeatsCount}/{trip.totalSeats} 
                  </td>
                  <td>{trip.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal giữ nguyên UI */}
      {showReportModal && (
        <div onClick={() => setShowReportModal(false)}>
          {/* modal UI như cũ */}
        </div>
      )}
    </div>
  );
}
