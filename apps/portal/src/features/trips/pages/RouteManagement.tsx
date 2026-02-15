// src/features/trips/pages/RouteManagement.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, UserPlus, Bus, Ticket, RefreshCw } from 'lucide-react';
// import { DriverAssignment } from '../DriverAssignment';
import type { Trip } from '@obtp/shared-types';
import { api } from '@obtp/api-client';

interface TripStats {
  totalTrips: number;
  scheduledTrips: number;
  runningTrips: number;
  totalTicketsSold: number;
}

export function RouteManagement() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    scheduledTrips: 0,
    runningTrips: 0,
    totalTicketsSold: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDriverAssignment, setShowDriverAssignment] = useState(false);
  const [selectedTripForDriver, setSelectedTripForDriver] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const statusConfig = {
    scheduled: { label: 'Đã lên lịch', color: 'bg-blue-500', textColor: 'text-blue-600' },
    departed: { label: 'Đang chạy', color: 'bg-orange-500', textColor: 'text-orange-600' },
    arrived: { label: 'Hoàn thành', color: 'bg-green-500', textColor: 'text-green-600' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500', textColor: 'text-red-600' }
  };

  // ✅ helper đảm bảo luôn có tripId
  const getTripId = (trip: Trip): string => {
    return (trip as any)?._id || (trip as any)?.id || '';
  };

  const getCompanyId = (): string => {
    try {
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.companyId || '';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return '';
  };

  const fetchTrips = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError('Không tìm thấy thông tin công ty. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.trips.getAllManagement(companyId);
      const tripsData = response || [];
      console.log(tripsData)
      setTrips(tripsData);
      
      const totalTrips = tripsData.length;
      const scheduledTrips = tripsData.filter((trip: Trip) => trip.status === 'scheduled').length;
      const runningTrips = tripsData.filter((trip: Trip) => trip.status === 'departed').length;
      
      let totalTicketsSold = 0;
      tripsData.forEach((trip: Trip) => {
        const totalSeats = trip.totalSeats || (trip.vehicleId as any)?.totalSeats || 40;
        const availableSeats = trip.availableSeatsCount || 0;
        const soldSeats = Math.max(0, totalSeats - availableSeats);
        totalTicketsSold += soldSeats;
      });

      setStats({
        totalTrips,
        scheduledTrips,
        runningTrips,
        totalTicketsSold
      });
      
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách chuyến đi';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTrips = async () => {
    const companyId = getCompanyId();
    if (!companyId) return;

    try {
      setLoading(true);
      
      const filteredTrips = await api.trips.searchWithFilter(companyId, searchQuery, filterStatus);
      setTrips(filteredTrips);
      
      const totalTrips = filteredTrips.length;
      const scheduledTrips = filteredTrips.filter((trip: Trip) => trip.status === 'scheduled').length;
      const runningTrips = filteredTrips.filter((trip: Trip) => trip.status === 'departed').length;
      
      let totalTicketsSold = 0;
      filteredTrips.forEach((trip: Trip) => {
        const totalSeats = trip.totalSeats || (trip.vehicleId as any)?.totalSeats || 40;
        const availableSeats = trip.availableSeatsCount || 0;
        const soldSeats = Math.max(0, totalSeats - availableSeats);
        totalTicketsSold += soldSeats;
      });

      setStats({
        totalTrips,
        scheduledTrips,
        runningTrips,
        totalTicketsSold
      });
      
    } catch (err: any) {
      console.error('Error filtering trips:', err);
      setError(err.response?.data?.message || 'Lỗi khi lọc dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        filterTrips();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filterStatus]);

  const handleDeleteTrip = async (trip: Trip, tripName: string) => {
    const tripId = getTripId(trip);

    if (!tripId) {
      console.error('TripId undefined:', trip);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn hủy chuyến đi "${tripName}"?`)) {
      return;
    }

    try {
      await api.trips.cancel(tripId);
      fetchTrips();
      alert('Đã hủy chuyến đi thành công!');
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert('Không thể hủy chuyến đi: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
    }
  };

  const handleEditTrip = (trip: Trip) => {
    const tripId = getTripId(trip);
    if (!tripId) return;
    navigate(`/company/trips/edit/${tripId}`);
  };

  const handleAssignDriver = (trip: Trip) => {
    const tripId = getTripId(trip);
    if (!tripId) return;
    setSelectedTripForDriver(tripId);
    setShowDriverAssignment(true);
  };

  const handleDriverAssigned = (driverId: string) => {
    console.log(`Driver ${driverId} assigned to trip ${selectedTripForDriver}`);
    alert('Đã phân công tài xế thành công!');
    setShowDriverAssignment(false);
    setSelectedTripForDriver(null);
  };

  const handleCreateNewTrip = () => {
    navigate('/company/trips/add');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const renderStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    return (
      <div className="flex items-center space-x-1.5">
        <div className={`w-2 h-2 ${config.color} rounded-full`}></div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    );
  };

  const getTripDisplayInfo = (trip: Trip) => {
    return api.trips.getTripDisplayInfo(trip);
  };

  const formatPrice = (price: number) => {
    return api.trips.formatPrice(price);
  };

  const formatDate = (date: Date | string) => {
    return api.trips.formatDate(date);
  };

  const formatTime = (date: Date | string) => {
    return api.trips.formatTime(date);
  };

  const renderTripRow = (trip: Trip) => {
    const tripId = getTripId(trip);

    const totalSeats = trip.totalSeats || (trip.vehicleId as any)?.totalSeats || 40;
    const soldSeats = Math.max(0, totalSeats - (trip.availableSeatsCount || 0));
    const soldPercentage = (soldSeats / totalSeats) * 100;
    
    const tripInfo = getTripDisplayInfo(trip);
    
    return (
      <tr key={tripId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700">
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white font-medium">{tripInfo.routeName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(trip.departureTime)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white">
            {formatTime(trip.departureTime)} - {formatTime(trip.expectedArrivalTime)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white">{tripInfo.vehiclePlate}</div>
          {tripInfo.vehicleType && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{tripInfo.vehicleType}</div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white font-medium">
            {formatPrice(trip.price)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-gray-900 dark:text-white">
              {soldSeats}/{totalSeats}
            </div>
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300"
                style={{ width: `${soldPercentage}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          {renderStatusBadge(trip.status as keyof typeof statusConfig)}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAssignDriver(trip)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Phân công tài xế"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditTrip(trip)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTrip(trip, tripInfo.routeName)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hủy chuyến"
              disabled={trip.status === 'departed' || trip.status === 'arrived'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Quản lý chuyến đi</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý lịch trình và chuyến đi của nhà xe</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={handleCreateNewTrip}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo chuyến mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tổng số chuyến</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduledTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đã lên lịch</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.runningTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đang chạy</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTicketsSold}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tổng vé đã bán</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tuyến đường, biển số..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="departed">Đang chạy</option>
            <option value="arrived">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Trip List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <Bus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery || filterStatus !== 'all' 
                ? 'Không tìm thấy chuyến đi phù hợp' 
                : 'Chưa có chuyến đi nào'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.' 
                : 'Hãy tạo chuyến đi đầu tiên để bắt đầu quản lý!'}
            </p>
            <button 
              onClick={handleCreateNewTrip}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo chuyến đi mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Giá vé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Số ghế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {trips.map(renderTripRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
