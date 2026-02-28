import type { Vehicle } from "@obtp/shared-types";
import { VehicleStatus } from "@obtp/shared-types";
import { Edit2, Trash2 } from "lucide-react";
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
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

export function VehicleTable({ vehicles, onEdit, onDelete }: Props) {
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return <Badge variant="success">Hoạt động</Badge>;
      case VehicleStatus.MAINTENANCE:
        return <Badge variant="warning">Bảo trì</Badge>;
      case VehicleStatus.INACTIVE:
        return <Badge variant="secondary">Ngưng HD</Badge>;
      default:
        return <Badge>N/A</Badge>;
    }
  };

  return (
    <div className="obtp-card obtp-card-strong">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Biển số</TableHead>
            <TableHead>Loại xe</TableHead>
            <TableHead>Số ghế</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-slate-500"
              >
                Chưa có xe nào
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-bold">{v.vehicleNumber}</TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell>{v.totalSeats}</TableCell>
                <TableCell>{getStatusBadge(v.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(v)}>
                    <Edit2 size={16} className="text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(v.id)}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
