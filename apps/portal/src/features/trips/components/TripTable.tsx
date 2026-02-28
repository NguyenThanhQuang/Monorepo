import type { Trip } from "@obtp/shared-types";
import { TripStatus } from "@obtp/shared-types";
import { Edit2, Trash2, UserPlus } from "lucide-react";
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );
const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("vi-VN");
const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

interface Props {
  trips: Trip[];
  onEdit: (tripId: string) => void;
  onCancel: (tripId: string, routeName: string) => void;
  onAssignDriver: (tripId: string) => void;
}

export function TripTable({ trips, onEdit, onCancel, onAssignDriver }: Props) {
  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case TripStatus.SCHEDULED:
        return <Badge variant="secondary">Đã lên lịch</Badge>;
      case TripStatus.DEPARTED:
        return <Badge variant="warning">Đang chạy</Badge>;
      case TripStatus.ARRIVED:
        return <Badge variant="success">Hoàn thành</Badge>;
      case TripStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>N/A</Badge>;
    }
  };

  return (
    <div className="obtp-card obtp-card-strong">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tuyến đường</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Xe</TableHead>
            <TableHead>Giá vé</TableHead>
            <TableHead>Chỗ ngồi</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-slate-500"
              >
                Không có chuyến đi nào
              </TableCell>
            </TableRow>
          ) : (
            trips.map((trip) => {
              const tripId = trip.id || trip._id;
              const route = trip.route as any;
              const vehicle = trip.vehicleId as any;

              const fromName = route?.fromLocationId?.name || "N/A";
              const toName = route?.toLocationId?.name || "N/A";
              const routeName = `${fromName} → ${toName}`;

              const totalSeats = trip.totalSeats || vehicle?.totalSeats || 40;
              const soldSeats = Math.max(
                0,
                totalSeats - (trip.availableSeatsCount || 0),
              );
              const soldPercentage = (soldSeats / totalSeats) * 100;

              const canCancel = trip.status === TripStatus.SCHEDULED;

              return (
                <TableRow key={tripId}>
                  <TableCell>
                    <div className="font-bold">{routeName}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(trip.departureTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatTime(trip.departureTime)} -{" "}
                    {formatTime(trip.expectedArrivalTime)}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">
                      {vehicle?.vehicleNumber || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {vehicle?.type}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">
                    {formatCurrency(trip.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {soldSeats}/{totalSeats}
                      </span>
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${soldPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(trip.status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAssignDriver(tripId)}
                      title="Phân công tài xế"
                    >
                      <UserPlus size={16} className="text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tripId)}
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCancel(tripId, routeName)}
                      disabled={!canCancel}
                      title="Hủy chuyến"
                    >
                      <Trash2
                        size={16}
                        className={
                          canCancel ? "text-red-600" : "text-slate-300"
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
  );
}
