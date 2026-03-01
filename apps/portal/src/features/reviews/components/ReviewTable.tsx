import type { Review } from "@obtp/shared-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Stars } from "./Stars";
import { MessageSquare, User, Bus } from "lucide-react";

export function ReviewTable({ reviews }: { reviews: Review[] }) {
  return (
    <div className="obtp-card obtp-card-strong overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Khách hàng</TableHead>
            <TableHead className="w-[150px]">Đánh giá</TableHead>
            <TableHead className="w-[250px]">Đối tượng</TableHead>
            <TableHead>Nội dung phản hồi</TableHead>
            <TableHead className="text-right">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-12 text-slate-500"
              >
                Chưa có phản hồi nào từ khách hàng.
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((r) => {
              const trip = r.tripId as any;
              const driver = r.driverId as any;

              const routeName = trip?.route
                ? `${trip.route.fromLocationId?.name} → ${trip.route.toLocationId?.name}`
                : "Không rõ chuyến";

              const vehiclePlate = trip?.vehicleId?.vehicleNumber || "Xe";

              return (
                <TableRow key={r.id || r._id}>
                  <TableCell>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {r.displayName}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Stars rating={r.rating} />
                  </TableCell>

                  <TableCell>
                    {r.targetType === "driver" ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit">
                          <User size={12} className="mr-1" /> Tài xế
                        </Badge>
                        <span className="text-sm font-semibold">
                          {driver?.name || "Không rõ"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          <Bus size={12} className="mr-1" /> Chuyến đi
                        </Badge>
                        <span
                          className="text-sm font-semibold truncate max-w-[200px]"
                          title={routeName}
                        >
                          {routeName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {vehiclePlate}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={16}
                        className="text-slate-400 mt-0.5 shrink-0"
                      />
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic line-clamp-3">
                        "{r.comment || "Không để lại bình luận"}"
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {r.isVisible ? (
                      <Badge variant="success">Công khai</Badge>
                    ) : (
                      <Badge variant="destructive">Bị ẩn (Bởi Admin)</Badge>
                    )}
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
