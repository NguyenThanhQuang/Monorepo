import { useState, useEffect } from 'react';
import { Search, Download, Eye, X as XIcon, Loader2, Calendar, User, Phone, MapPin, Clock } from 'lucide-react';
import {  BookingStatus, type Booking } from '@obtp/shared-types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { api } from '@obtp/api-client';

export function BookingManagement() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Định nghĩa cấu hình cho các trạng thái booking
  const statusConfig = {
    [BookingStatus.PENDING]: { 
      label: t('pendingBookings'), 
      color: 'bg-gray-500', 
      textColor: 'text-gray-700 dark:text-gray-400' 
    },
    [BookingStatus.HELD]: { 
      label: t('heldBookings'), 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700 dark:text-yellow-400' 
    },
    [BookingStatus.CONFIRMED]: { 
      label: t('confirmedBookings'), 
      color: 'bg-green-500', 
      textColor: 'text-green-700 dark:text-green-400' 
    },
    [BookingStatus.CANCELLED]: { 
      label: t('cancelledBookings'), 
      color: 'bg-red-500', 
      textColor: 'text-red-700 dark:text-red-400' 
    },
    [BookingStatus.EXPIRED]: { 
      label: t('expiredBookings'), 
      color: 'bg-gray-400', 
      textColor: 'text-gray-600 dark:text-gray-300' 
    },
  };

  // Lấy danh sách booking từ API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.bookings.getCompanyBookings();
      setBookings(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đặt vé');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      b.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactPhone?.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString.toString();
    }
  };

  const totalRevenue = bookings
    .filter(b => b.status === BookingStatus.CONFIRMED)
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const handleCancelBooking = async (id: string) => {
    if (!confirm(t('confirmCancelBooking'))) return;
    
    try {
      await api.bookings.cancel(id);
      await fetchBookings(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Không thể hủy vé');
    }
  };

  const handleDownloadTicket = async (booking: Booking) => {
    if (!booking.ticketCode) {
      alert('Vé chưa có mã vé để tải về');
      return;
    }

    try {
      setDownloading(booking.id);
      // Tạo nội dung vé dạng text
      const ticketContent = `
        =================================
        VÉ XE KHÁCH - ${booking.tripId?.companyId?.name || 'Nhà xe'}
        =================================
        Mã vé: ${booking.ticketCode}
        Ngày đặt: ${formatDate(booking.createdAt)}
        ---------------------------------
        HÀNH KHÁCH: ${booking.contactName}
        Điện thoại: ${booking.contactPhone}
        Email: ${booking.contactEmail || 'N/A'}
        ---------------------------------
        TUYẾN ĐƯỜNG: ${booking.tripId?.route?.fromLocationId?.name || 'N/A'} → ${booking.tripId?.route?.toLocationId?.name || 'N/A'}
        Giờ khởi hành: ${formatDate(booking.tripId?.departureTime || '')}
        ---------------------------------
        CHI TIẾT GHẾ:
        ${booking.passengers?.map(p => `• ${p.name} - Ghế ${p.seatNumber}: ${formatPrice(p.price)}`).join('\n')}
        ---------------------------------
        TỔNG TIỀN: ${formatPrice(booking.totalAmount || 0)}
        Trạng thái: ${statusConfig[booking.status]?.label || booking.status}
        =================================
        Cảm ơn quý khách đã sử dụng dịch vụ!
      `;

      // Tạo blob và download
      const blob = new Blob([ticketContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ve-xe-${booking.ticketCode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      alert('Không thể tải vé xuống');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading')}...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('bookingManagementTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('bookingManagementDesc')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bookings.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalBookingsCount')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {bookings.filter(b => b.status === BookingStatus.HELD).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('heldBookings')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {bookings.filter(b => b.status === BookingStatus.CONFIRMED).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('confirmedBookings')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {bookings.filter(b => b.status === BookingStatus.CANCELLED).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('cancelledBookings')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalRevenueLabel')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchBooking')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">{t('allStatus')}</option>
            <option value={BookingStatus.PENDING}>{t('pendingBookings')}</option>
            <option value={BookingStatus.HELD}>{t('heldBookings')}</option>
            <option value={BookingStatus.CONFIRMED}>{t('confirmedBookings')}</option>
            <option value={BookingStatus.CANCELLED}>{t('cancelledBookings')}</option>
            <option value={BookingStatus.EXPIRED}>{t('expiredBookings')}</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Booking List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('ticketCodeColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('passengerColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('routeColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('timeColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('seat')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('priceColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery || filterStatus !== 'all' ? t('noMatchingBookings') : t('noBookingsFound')}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const statusInfo = statusConfig[booking.status] || { 
                    label: booking.status, 
                    color: 'bg-gray-500',
                    textColor: 'text-gray-600 dark:text-gray-400'
                  };
                  const routeName = booking.tripId?.route 
                    ? `${booking.tripId.route.fromLocationId?.name || ''} → ${booking.tripId.route.toLocationId?.name || ''}`
                    : 'N/A';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {booking.ticketCode || `#${booking.id.slice(-8)}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">{booking.contactName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.contactPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {routeName}
                      </td>
                      <td className="px-6 py-4">
                        {booking.tripId?.departureTime ? (
                          <>
                            <div className="text-gray-900 dark:text-white">
                              {format(new Date(booking.tripId.departureTime), 'HH:mm')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(booking.tripId.departureTime.toString()), 'dd/MM/yyyy')}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {booking.passengers?.map(p => p.seatNumber).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {formatPrice(booking.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 ${statusInfo.color} rounded-full`}></div>
                          <span className={`text-sm ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t('viewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(booking.status === BookingStatus.HELD || booking.status === BookingStatus.PENDING) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title={t('cancelBooking')}
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('bookingDetails')}</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header với mã vé */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('ticketCode')}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedBooking.ticketCode || `#${selectedBooking.id.slice(-8)}`}
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(selectedBooking.createdAt)}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    {t('passenger')}
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white">{selectedBooking.contactName}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    {t('phoneNumber')}
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white">{selectedBooking.contactPhone}</div>
                </div>
              </div>

              {/* Thông tin chuyến đi */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('route')}
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedBooking.tripId?.route 
                    ? `${selectedBooking.tripId.route.fromLocationId?.name || ''} → ${selectedBooking.tripId.route.toLocationId?.name || ''}`
                    : 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedBooking.tripId?.departureTime 
                    ? format(new Date(selectedBooking.tripId.departureTime), 'HH:mm dd/MM/yyyy')
                    : 'N/A'}
                </div>
              </div>

              {/* Danh sách hành khách */}
              {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    {t('passengerList')} ({selectedBooking.passengers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedBooking.passengers.map((passenger, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{passenger.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{passenger.phone}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 dark:text-white">Ghế {passenger.seatNumber}</div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">{formatPrice(passenger.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông tin thanh toán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalAmount')}</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(selectedBooking.totalAmount || 0)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('status')}</div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${statusConfig[selectedBooking.status]?.color || 'bg-gray-500'} rounded-full mr-2`}></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {statusConfig[selectedBooking.status]?.label || selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => handleDownloadTicket(selectedBooking)}
                  disabled={downloading === selectedBooking.id || !selectedBooking.ticketCode}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === selectedBooking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{t('downloadTicket')}</span>
                </button>
                {(selectedBooking.status === BookingStatus.HELD || selectedBooking.status === BookingStatus.PENDING) && (
                  <button
                    onClick={() => {
                      if (confirm(t('confirmCancelBooking'))) {
                        handleCancelBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                  >
                    {t('cancelBooking')}
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}