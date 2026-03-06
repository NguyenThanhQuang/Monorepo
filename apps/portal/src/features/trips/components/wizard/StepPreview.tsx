import { useFormContext } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";
import { format } from "date-fns";
import { Bus, Calendar, Clock, Ticket, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StepPreview() {
  const { watch } = useFormContext();
  const { vehicles, locations } = useTripDependencies();
  const formData = watch();
  const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const fromLocation = locations.find(
    (l) => l.id === formData.route.fromLocationId,
  );
  const toLocation = locations.find(
    (l) => l.id === formData.route.toLocationId,
  );

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa chọn";
    try {
      return format(new Date(dateStr), "HH:mm - dd/MM/yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">
        Xác nhận thông tin chuyến đi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CỘT 1: THÔNG TIN XE & CẤU HÌNH */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold flex items-center mb-3 text-slate-700 dark:text-slate-300">
              <Bus className="mr-2 w-5 h-5 text-blue-500" /> Phương tiện
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Biển số:</span>
                <span className="font-bold">
                  {vehicle?.vehicleNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loại xe:</span>
                <span>{vehicle?.type || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số ghế:</span>
                <span>{vehicle?.totalSeats || 0} chỗ</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold flex items-center mb-3 text-slate-700 dark:text-slate-300">
              <Ticket className="mr-2 w-5 h-5 text-green-500" /> Giá vé & Cấu
              hình
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Giá vé niêm yết:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatMoney(formData.price)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Chế độ lặp lại:</span>
                {formData.isRecurrenceTemplate ? (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Repeat size={12} /> Chuyến mẫu hằng ngày
                  </Badge>
                ) : (
                  <Badge variant="secondary">Một lần duy nhất</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: LỊCH TRÌNH */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold flex items-center mb-3 text-slate-700 dark:text-slate-300">
            <Calendar className="mr-2 w-5 h-5 text-orange-500" /> Lịch trình chi
            tiết
          </h4>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-6 pb-6 space-y-6">
            {/* Điểm đi */}
            <div className="relative">
              <div className="absolute -left-[31px] bg-blue-500 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900"></div>
              <div className="font-bold text-base">{fromLocation?.name}</div>
              <div className="text-xs text-slate-500">
                {fromLocation?.province}
              </div>
              <div className="flex items-center text-blue-600 text-sm mt-1 font-medium ">
                <Clock size={14} className="mr-1" />{" "}
                {formatDate(formData.departureTime)}
              </div>
            </div>

            {/* Các trạm dừng (nếu có) */}
            {formData.route?.stops?.map((stop: any, idx: number) => {
              const stopLoc = locations.find((l) => l._id === stop.locationId);
              return (
                <div key={idx} className="relative">
                  <div className="absolute -left-[29px] bg-slate-300 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900"></div>
                  <div className="text-sm font-medium">
                    {stopLoc?.name || "Trạm dừng"}
                  </div>
                  <div className="text-xs text-slate-400">
                    Đến: {formatDate(stop.expectedArrivalTime)}
                  </div>
                </div>
              );
            })}

            {/* Điểm đến */}
            <div className="relative">
              <div className="absolute -left-[31px] bg-orange-500 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900"></div>
              <div className="font-bold text-base">{toLocation?.name}</div>
              <div className="text-xs text-slate-500">
                {toLocation?.province}
              </div>
              <div className="flex items-center text-orange-600 text-sm mt-1 font-medium">
                <Clock size={14} className="mr-1" />{" "}
                {formatDate(formData.expectedArrivalTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
