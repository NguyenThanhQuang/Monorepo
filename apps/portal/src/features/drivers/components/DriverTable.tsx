import { Edit2, Trash2, Phone, User, FileBadge } from "lucide-react";
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
import type { DriverResponse } from "@obtp/shared-types";

interface Props {
  drivers: DriverResponse[];
  onEdit: (driver: DriverResponse) => void;
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
            <TableHead>Bằng lái / CCCD</TableHead>
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
                className="text-center py-12 text-slate-500"
              >
                Chưa có tài xế nào. Hãy thêm mới ngay!
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {driver.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Tham gia:{" "}
                        {new Date(driver.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                    <Phone size={14} className="mr-2" />
                    {driver.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-sm font-mono text-slate-700 dark:text-slate-300">
                      <FileBadge size={14} className="mr-1.5 text-blue-500" />
                      {driver.licenseNumber}
                    </div>
                    <div className="text-xs text-slate-400 ml-5">
                      ID: {driver.idCardNumber}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {driver.experienceYears} năm
                  </Badge>
                </TableCell>
                <TableCell>
                  {driver.status === "active" ? (
                    <Badge variant="success">Hoạt động</Badge>
                  ) : (
                    <Badge variant="destructive">Đã khóa</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(driver)}
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 size={16} className="text-blue-600" />
                  </Button>
                  {driver.status === "active" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(driver.id)}
                      title="Vô hiệu hóa tài khoản"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
