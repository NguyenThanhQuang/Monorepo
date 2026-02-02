import type { BookingUI } from '@obtp/shared-types';
import { Eye } from 'lucide-react';

export function BookingTable({
  data,
  onView,
}: {
  data: BookingUI[];
  onView: (b: BookingUI) => void;
}) {
  return (
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th>Mã vé</th>
          <th>Khách</th>
          <th>Tuyến</th>
          <th>Giờ</th>
          <th>Ghế</th>
          <th>Giá</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data.map((b) => (
          <tr key={b.id}>
            <td>{b.ticketCode}</td>
            <td>{b.passengerName}</td>
            <td>{b.route}</td>
            <td>{b.departureTime}</td>
            <td>{b.seatNumber}</td>
            <td>{b.price.toLocaleString()}đ</td>
            <td>
              <button onClick={() => onView(b)}>
                <Eye className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
