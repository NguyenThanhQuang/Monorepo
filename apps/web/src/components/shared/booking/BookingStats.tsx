import type { BookingUI } from "@obtp/shared-types";

export function BookingStats({ bookings }: { bookings: BookingUI[] }) {
  const revenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + b.price, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Stat title="Tổng vé" value={bookings.length} />
      <Stat title="Đã xác nhận" value={bookings.filter(b => b.status === 'confirmed').length} />
      <Stat title="Đã huỷ" value={bookings.filter(b => b.status === 'cancelled').length} />
      <Stat title="Doanh thu" value={revenue.toLocaleString('vi-VN') + 'đ'} />
    </div>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border">
      <div className="text-2xl">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}
