import { useState } from "react";
import { Download, XCircle, Search } from "lucide-react";
import { BookingStatus, type Booking } from "@obtp/shared-types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  bookings: Booking[];
  onCancel: (id: string) => void;
  onDownload: (booking: Booking) => void;
}

export function BookingTable({ bookings, onCancel, onDownload }: Props) {
  const [filter, setFilter] = useState("");

  const filteredData = bookings.filter(
    (b) =>
      b.ticketCode?.toLowerCase().includes(filter.toLowerCase()) ||
      b.contactName.toLowerCase().includes(filter.toLowerCase()) ||
      b.contactPhone.includes(filter),
  );

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <Badge variant="success">Đã thanh toán</Badge>;
      case BookingStatus.HELD:
        return <Badge variant="warning">Giữ chỗ</Badge>;
      case BookingStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      case BookingStatus.PENDING:
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      default:
        return <Badge>N/A</Badge>;
    }
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Tìm theo mã vé, tên, SĐT..."
            className="pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="obtp-card obtp-card-strong overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã vé</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Chuyến đi</TableHead>
              <TableHead>Ghế</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  Không tìm thấy vé phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((b) => {
                const trip = b.tripId as any;
                const routeName = trip?.route
                  ? `${trip.route.fromLocationId?.name || ""} → ${trip.route.toLocationId?.name || ""}`
                  : "N/A";

                return (
                  <TableRow key={b.id || b._id}>
                    <TableCell className="font-bold text-blue-600">
                      {b.ticketCode || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{b.contactName}</div>
                      <div className="text-xs text-slate-500">
                        {b.contactPhone}
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={routeName}
                    >
                      <div className="text-sm">{routeName}</div>
                      <div className="text-xs text-slate-500">
                        {trip?.departureTime
                          ? new Date(trip.departureTime).toLocaleDateString(
                              "vi-VN",
                            )
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {b.passengers.map((p) => p.seatNumber).join(", ")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(b.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(b)}
                        title="Tải vé"
                      >
                        <Download size={16} className="text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={b.status === BookingStatus.CANCELLED}
                        onClick={() => onCancel(b.id || b._id)}
                        title="Hủy vé"
                      >
                        <XCircle
                          size={16}
                          className={
                            b.status === BookingStatus.CANCELLED
                              ? "text-slate-300"
                              : "text-red-500"
                          }
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
