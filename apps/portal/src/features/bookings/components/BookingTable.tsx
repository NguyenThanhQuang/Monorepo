import { useState } from "react";
import { Download, XCircle, Search, Edit2, User, Ticket } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Props {
  bookings: Booking[];
  onEditInfo: (booking: Booking) => void;
  onCancel: (id: string) => void;
  onDownload: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  onEditInfo,
  onCancel,
  onDownload,
}: Props) {
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
        return <Badge variant="success">Đã xác nhận</Badge>;
      case BookingStatus.HELD:
        return <Badge variant="warning">Đang giữ chỗ</Badge>;
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

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Search Toolbar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            hasIcon
            placeholder="Tìm theo mã vé, tên khách, số điện thoại..."
            className="pl-10 h-11 border-slate-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 font-medium hidden sm:block">
          Hiển thị <span className="text-blue-600">{filteredData.length}</span>{" "}
          trên tổng số {bookings.length} vé
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="obtp-card obtp-card-strong overflow-hidden border-none shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[140px] font-bold">Mã vé</TableHead>
              <TableHead className="font-bold">Khách hàng</TableHead>
              <TableHead className="font-bold">Chuyến đi</TableHead>
              <TableHead className="font-bold text-center">Ghế</TableHead>
              <TableHead className="font-bold text-right">Tổng tiền</TableHead>
              <TableHead className="font-bold text-center">
                Trạng thái
              </TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-20 text-slate-400 italic"
                >
                  <Ticket className="mx-auto h-12 w-12 text-slate-200 mb-2" />
                  Không tìm thấy đơn đặt vé nào phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((b) => {
                const trip = b.tripId as any;
                const fromName = trip?.route?.fromLocationId?.name || "";
                const toName = trip?.route?.toLocationId?.name || "";
                const routeName =
                  fromName && toName
                    ? `${fromName} → ${toName}`
                    : "Thông tin đang tải...";
                const isCancelled = b.status === BookingStatus.CANCELLED;

                return (
                  <TableRow
                    key={b.id || b._id}
                    className={cn(
                      isCancelled &&
                        "opacity-60 bg-slate-50/30 dark:bg-slate-900/10",
                    )}
                  >
                    {/* TICKET CODE */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-600 tracking-wider">
                          {b.ticketCode || "PENDING"}
                        </span>
                      </div>
                    </TableCell>

                    {/* CUSTOMER INFO */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1 italic">
                            {b.contactName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {b.contactPhone}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* TRIP DETAILS */}
                    <TableCell className="max-w-[220px]">
                      <div
                        className="text-sm font-semibold truncate"
                        title={routeName}
                      >
                        {routeName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        Ngày đi: {formatDate(trip?.departureTime)}
                      </div>
                    </TableCell>

                    {/* SEATS */}
                    <TableCell className="text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {b.passengers.map((p, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-bold uppercase"
                          >
                            {p.seatNumber}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {/* TOTAL AMOUNT */}
                    <TableCell className="text-right">
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatMoney(b.totalAmount)}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="text-center">
                      {getStatusBadge(b.status)}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      {/* Button Edit Customer Info */}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isCancelled}
                        onClick={() => onEditInfo(b)}
                        className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 size={16} />
                      </Button>

                      {/* Button Download Ticket */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(b)}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Tải/In vé điện tử"
                      >
                        <Download size={16} className="text-slate-600" />
                      </Button>

                      {/* Button Cancel Booking */}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={
                          isCancelled ||
                          (b.status === BookingStatus.CONFIRMED && false)
                        }
                        onClick={() => onCancel(b.id || b._id)}
                        className={cn(
                          "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20",
                          isCancelled ? "text-slate-300" : "text-red-500",
                        )}
                        title="Hủy vé này"
                      >
                        <XCircle size={16} />
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
