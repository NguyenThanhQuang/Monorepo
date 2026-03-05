import type { BookingStatus, BookingUI } from '@obtp/shared-types';
import { X } from 'lucide-react';

interface BookingDetailModalProps {
  booking: BookingUI;
  onClose: () => void;
}

export function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chi tiết đặt vé
            </h3>
            <p className="text-sm text-gray-500">
              Mã vé: <span className="font-medium">{booking.ticketCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Hành khách" value={booking.passengerName} />
          <Info label="Số điện thoại" value={booking.phone} />

          <Info label="Tuyến xe" value={booking.route} />
          <Info label="Giờ xuất phát" value={booking.departureTime} />

          <Info label="Số ghế" value={booking.seatNumber} />
          <Info
            label="Giá vé"
            value={booking.price.toLocaleString('vi-VN') + 'đ'}
          />

          <Info
            label="Biển số xe"
            value={booking.vehiclePlate || '—'}
          />

          <StatusBadge status={booking.status} />
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUB COMPONENTS ---------------- */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-gray-900 dark:text-white font-medium">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-gray-100 text-gray-700',
    held: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
  };

  const label: Record<BookingStatus, string> = {
    pending: 'Đang khởi tạo',
    held: 'Giữ chỗ',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã huỷ',
    expired: 'Hết hạn',
  };





  return (
    <div>
      <div className="text-xs uppercase text-gray-500 mb-1">
        Trạng thái
      </div>
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${map[status]}`}
      >
        {label[status]}
      </span>
    </div>
  );
}
