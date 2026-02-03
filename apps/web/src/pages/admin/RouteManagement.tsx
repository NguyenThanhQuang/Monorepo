import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Bus,
  MapPin,
  Clock,
  User,
  Trash2,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { tripApi } from '../../api/service/trips/trips.api';


export default function RouteManagement() {
  const { t } = useLanguage();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');

  /* ================= FETCH ================= */
  useEffect(() => {
    setLoading(true);
    tripApi
      .getManagementTrips()
      .then((res) => setTrips(res.data))
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const keyword =
        trip.route?.fromLocationId?.name +
        trip.route?.toLocationId?.name +
        trip.vehicleId?.vehicleNumber;

      const matchSearch = keyword
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || trip.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [trips, search, statusFilter]);

  /* ================= ACTION ================= */
  const handleCancelTrip = async (id: string) => {
    await tripApi.cancelTrip(id);
    setTrips((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: 'cancelled' } : t,
      ),
    );
  };

  /* ================= STATUS UI ================= */
  const statusUI: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    running: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('routeManagement')}
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý tuyến xe, chuyến chạy và tài xế
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow">
          <Plus className="w-4 h-4" />
          Tạo chuyến mới
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tuyến, biển số xe..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Chưa chạy</option>
          <option value="running">Đang chạy</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Đang tải dữ liệu...
          </div>
        )}

        {!loading &&
          filteredTrips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm flex flex-col gap-4"
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Bus className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trip.route.fromLocationId.name} →{' '}
                      {trip.route.toLocationId.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {trip.vehicleId.vehicleNumber}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    statusUI[trip.status]
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {trip.startTime} – {trip.endTime}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {trip.route.distance} km
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {trip.driver?.fullName || 'Chưa phân công'}
                </div>
              </div>

              {/* ACTION */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button className="px-4 py-2 text-sm rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa
                </button>

                {trip.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelTrip(trip._id)}
                    className="px-4 py-2 text-sm rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Huỷ chuyến
                  </button>
                )}
              </div>
            </div>
          ))}

        {!loading && filteredTrips.length === 0 && (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            Không tìm thấy chuyến phù hợp
          </div>
        )}
      </div>
    </div>
  );
}
