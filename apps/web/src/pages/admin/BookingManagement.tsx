import { Search, Eye, X as XIcon, Download } from 'lucide-react';
import { BookingStatus } from '@obtp/shared-types';
import { useBookingManagement } from '../../hooks/Logic/useBookingManagement';
import { useLanguage } from '../../contexts/LanguageContext';

export function BookingManagement() {
  const { t } = useLanguage();
  const {
    filteredBookings,
    totalRevenue,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedBooking,
    setSelectedBooking,
  } = useBookingManagement();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const statusConfig = {
    [BookingStatus.CONFIRMED]: { label: t('confirmedBookings'), color: 'bg-green-500' },
    [BookingStatus.CANCELLED]: { label: t('cancelledBookings'), color: 'bg-red-500' },
    [BookingStatus.HELD]: { label: 'Held', color: 'bg-yellow-500' },
    [BookingStatus.PENDING]: { label: 'Pending', color: 'bg-gray-400' },
    [BookingStatus.EXPIRED]: { label: 'Expired', color: 'bg-gray-600' },
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-gray-900 dark:text-white">
          {t('bookingManagementTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('bookingManagementDesc')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchBooking')}
              className="w-full pl-10 pr-4 py-2 rounded-xl"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e =>
              setFilterStatus(
                e.target.value === 'all'
                  ? 'all'
                  : (e.target.value as BookingStatus),
              )
            }
            className="px-4 py-2 rounded-xl"
          >
            <option value="all">{t('allStatus')}</option>
            <option value={BookingStatus.CONFIRMED}>
              {t('confirmedBookings')}
            </option>
            <option value={BookingStatus.CANCELLED}>
              {t('cancelledBookings')}
            </option>
            <option value={BookingStatus.HELD}>Held</option>
            <option value={BookingStatus.EXPIRED}>Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th>{t('ticketCode')}</th>
              <th>{t('passenger')}</th>
              <th>{t('route')}</th>
              <th>{t('price')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => {
              const status = statusConfig[b.status];
              return (
                <tr key={b.id}>
                  <td>{b.ticketCode}</td>
                  <td>{b.passengerName}</td>
                  <td>{b.route}</td>
                  <td>{formatPrice(b.price)}</td>
                  <td>
                    <span
                      className={`${status.color} text-white px-2 py-1 rounded`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between mb-4">
              <h3>{t('bookingDetails')}</h3>
              <button onClick={() => setSelectedBooking(null)}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-2">
              <div>{selectedBooking.ticketCode}</div>
              <div>{selectedBooking.passengerName}</div>
              <div>{selectedBooking.phone}</div>
              <div>{formatPrice(selectedBooking.price)}</div>
            </div>

            <button className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
              <Download className="w-4 h-4" />
              {t('downloadTicket')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
