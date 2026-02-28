import { BookingStatus, type Booking } from "@obtp/shared-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

export function RecentBookingsTable({ bookings }: { bookings: Booking[] }) {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <Badge variant="success">Đã xác nhận</Badge>;
      case BookingStatus.HELD:
        return <Badge variant="warning">Đang giữ</Badge>;
      case BookingStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>Chờ xử lý</Badge>;
    }
  };

  return (
    <div className="obtp-card obtp-card-strong overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold">Đơn đặt vé gần đây</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã vé</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Tuyến đường</TableHead>
            <TableHead>Số ghế</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-slate-500"
              >
                Chưa có đơn đặt nào
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((b) => {
              const trip = b.tripId as any;
              const routeName = trip?.route
                ? `${trip.route.fromLocationId?.name || ""} → ${trip.route.toLocationId?.name || ""}`
                : "N/A";

              return (
                <TableRow key={b._id || b.id}>
                  <TableCell className="font-bold">
                    {b.ticketCode || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{b.contactName}</div>
                    <div className="text-xs text-slate-500">
                      {b.contactPhone}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {routeName}
                  </TableCell>
                  <TableCell>
                    {b.passengers.map((p) => p.seatNumber).join(", ")}
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">
                    {formatCurrency(b.totalAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(b.status)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
