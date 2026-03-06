import type { Vehicle } from "@obtp/shared-types";
import { VehicleStatus } from "@obtp/shared-types";
import { Edit2, PlayCircle, Trash2, Wrench, AlertCircle } from "lucide-react";
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

interface ExtendedVehicle extends Vehicle {
  hasActiveTrips?: boolean;
}

interface Props {
  vehicles: Vehicle[];
  onEdit: (vehicle: ExtendedVehicle) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: VehicleStatus) => void;
}

export function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return <Badge variant="success">Hoạt động</Badge>;
      case VehicleStatus.MAINTENANCE:
        return <Badge variant="warning">Bảo trì</Badge>;
      case VehicleStatus.INACTIVE:
        return <Badge variant="secondary">Ngưng HĐ</Badge>;
      default:
        return <Badge>N/A</Badge>;
    }
  };

  return (
    <div className="obtp-card obtp-card-strong overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Biển số</TableHead>
            <TableHead>Loại xe</TableHead>
            <TableHead>Số ghế</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác nhanh</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-slate-500"
              >
                Chưa có xe nào trong đội hình.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => {
              const v = vehicle as ExtendedVehicle;
              const isBusy = !!v.hasActiveTrips;

              return (
                <TableRow
                  key={v.id}
                  className={cn(
                    "transition-colors",
                    isBusy && "bg-slate-50/50 dark:bg-slate-900/20",
                  )}
                >
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          isBusy ? "text-slate-900 dark:text-slate-100" : ""
                        }
                      >
                        {v.vehicleNumber}
                      </span>
                      {isBusy && (
                        <div
                          title="Xe đang có chuyến đi đã lên lịch, một số thao tác bị hạn chế để đảm bảo an toàn dữ liệu."
                          className="text-amber-500 animate-pulse"
                        >
                          <AlertCircle size={14} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.totalSeats}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>

                  <TableCell className="text-right space-x-1">
                    {/* NÚT THAY ĐỔI TRẠNG THÁI (BẢO TRÌ/HOẠT ĐỘNG) */}
                    {v.status === VehicleStatus.ACTIVE ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        onClick={() =>
                          onStatusChange(v.id, VehicleStatus.MAINTENANCE)
                        }
                        title={
                          isBusy
                            ? "Không thể bảo trì khi đang có lịch chạy"
                            : "Đưa vào bảo trì"
                        }
                        className={cn(
                          "transition-all",
                          isBusy
                            ? "opacity-20 cursor-not-allowed"
                            : "hover:bg-amber-50 text-amber-500",
                        )}
                      >
                        <Wrench size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onStatusChange(v.id, VehicleStatus.ACTIVE)
                        }
                        title="Kích hoạt hoạt động"
                        className="hover:bg-green-50 text-green-500"
                      >
                        <PlayCircle size={16} />
                      </Button>
                    )}

                    {/* NÚT CHỈNH SỬA THÔNG SỐ */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => onEdit(v)}
                      title={
                        isBusy
                          ? "Không thể sửa cấu trúc xe khi đang có lịch chạy"
                          : "Sửa thông số"
                      }
                      className={cn(
                        "transition-all",
                        isBusy
                          ? "opacity-20 cursor-not-allowed"
                          : "hover:bg-blue-50 text-blue-600",
                      )}
                    >
                      <Edit2 size={16} />
                    </Button>

                    {/* NÚT XÓA / NGỪNG HOẠT ĐỘNG VĨNH VIỄN */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => onDelete(v.id)}
                      title={
                        isBusy
                          ? "Không thể xóa xe khi đang bận"
                          : "Ngừng hoạt động"
                      }
                      className={cn(
                        "transition-all",
                        isBusy
                          ? "opacity-20 cursor-not-allowed"
                          : "hover:bg-red-50 text-red-600",
                      )}
                    >
                      <Trash2 size={16} />
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
