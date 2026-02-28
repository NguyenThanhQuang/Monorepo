import { Edit2, Trash2, Phone, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Driver } from "../api/useDrivers";

interface Props {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
}

export function DriverTable({ drivers, onEdit, onDelete }: Props) {
  return (
    <div className="obtp-card obtp-card-strong overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tài xế</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Bằng lái</TableHead>
            <TableHead>Kinh nghiệm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-slate-500"
              >
                Chưa có tài xế nào
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {driver.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Phone size={14} className="mr-2" />
                    {driver.phone}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {driver.licenseNumber}
                </TableCell>
                <TableCell>{driver.tripCount} chuyến</TableCell>
                <TableCell>
                  {driver.status === "active" ? (
                    <Badge variant="success">Hoạt động</Badge>
                  ) : (
                    <Badge variant="secondary">Nghỉ phép</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(driver)}
                  >
                    <Edit2 size={16} className="text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(driver.id)}
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
