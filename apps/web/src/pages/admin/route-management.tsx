import { Search, UserPlus } from 'lucide-react';
import { useRouteManagementLogic } from '../../hooks/Logic/route-management.logic';

export function RouteManagement() {
  const {
    t,
    trips,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
  } = useRouteManagementLogic();

  return (
    <div className="p-6">
      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchRoute')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-xl border"
        >
          <option value="all">{t('allStatus')}</option>
          <option value="scheduled">{t('scheduledStatus')}</option>
          <option value="running">{t('runningStatus')}</option>
          <option value="completed">{t('completedStatus')}</option>
          <option value="cancelled">{t('cancelledStatus')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">{t('route')}</th>
              <th className="px-6 py-3">{t('time')}</th>
              <th className="px-6 py-3">{t('vehicle')}</th>
              <th className="px-6 py-3">{t('price')}</th>
              <th className="px-6 py-3">{t('seats')}</th>
              <th className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>

          <tbody>
            {trips.map(trip => {
              const sold = trip.totalSeats - trip.availableSeats;

              return (
                <tr key={trip.id} className="border-t">
                  <td className="px-6 py-4">
                    {trip.fromName} → {trip.toName}
                    <div className="text-sm text-gray-500">{trip.date}</div>
                  </td>

                  <td className="px-6 py-4">
                    {trip.departureTime} - {trip.arrivalTime}
                  </td>

                  <td className="px-6 py-4">{trip.vehiclePlate}</td>

                  <td className="px-6 py-4">
                    {trip.price.toLocaleString('vi-VN')}đ
                  </td>

                  <td className="px-6 py-4">
                    {sold}/{trip.totalSeats}
                  </td>

                  <td className="px-6 py-4">
                    <button className="p-2 text-green-600">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
