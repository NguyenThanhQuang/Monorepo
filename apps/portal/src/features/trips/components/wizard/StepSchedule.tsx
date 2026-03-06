import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@obtp/api-client";
import { calculateScheduleTimestamps } from "@/utils/schedule-calculator";
import type { GeoPoint } from "@obtp/shared-types";

// Hàm hỗ trợ parse Date sang string định dạng YYYY-MM-DDTHH:mm cho input type="datetime-local"
const formatDateTimeForInput = (d: Date) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export function StepSchedule() {
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { locations } = useTripDependencies();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "route.stops",
  });

  const fromLocationId = watch("route.fromLocationId");
  const toLocationId = watch("route.toLocationId");

  // Hàm xử lý Tự động tính toán
  const handleAutoCalculate = async () => {
    const values = getValues();
    const depTimeStr = values.departureTime;
    const fromId = values.route?.fromLocationId;
    const toId = values.route?.toLocationId;
    const stops = values.route?.stops || [];

    // 1. Validate Input cơ bản
    if (!depTimeStr) {
      return toast.error("Vui lòng chọn Thời gian khởi hành trước.");
    }
    if (!fromId || !toId) {
      return toast.error(
        "Vui lòng quay lại Bước 1 để chọn Điểm đi và Điểm đến.",
      );
    }

    // 2. Lấy tọa độ Điểm đi và Điểm đến
    const fromLoc = locations.find((l) => l.id === fromId || l._id === fromId);
    const toLoc = locations.find((l) => l.id === toId || l._id === toId);

    if (!fromLoc || !toLoc) {
      return toast.error("Lỗi: Không tìm thấy tọa độ Điểm đi hoặc Điểm đến.");
    }

    const waypoints: GeoPoint[] = [];

    // GeoJSON trong MongoDB là[longitude, latitude]
    waypoints.push({
      lat: fromLoc.location.coordinates[1],
      lng: fromLoc.location.coordinates[0],
    });

    // 3. Lấy tọa độ các Trạm dừng
    for (let i = 0; i < stops.length; i++) {
      const stopId = stops[i].locationId;
      if (!stopId) {
        return toast.error(`Vui lòng chọn địa điểm cho Trạm dừng số ${i + 1}`);
      }
      const stopLoc = locations.find(
        (l) => l.id === stopId || l._id === stopId,
      );
      if (!stopLoc) {
        return toast.error(`Lỗi: Không tìm thấy tọa độ Trạm dừng số ${i + 1}`);
      }
      waypoints.push({
        lat: stopLoc.location.coordinates[1],
        lng: stopLoc.location.coordinates[0],
      });
    }

    waypoints.push({
      lat: toLoc.location.coordinates[1],
      lng: toLoc.location.coordinates[0],
    });

    // 4. Gọi API & Xử lý điền Form
    try {
      setIsCalculating(true);
      const res = await api.maps.calculateRoute({ waypoints });

      // Đảm bảo tương thích nếu backend trả về sai định dạng
      const legDurations = res.legDurations || [res.duration];
      if (legDurations.length !== waypoints.length - 1) {
        throw new Error("Dữ liệu trả về từ bản đồ không khớp với số chặng.");
      }

      // Gọi hàm logic thuần đã viết ở Bước 3
      const schedule = calculateScheduleTimestamps(
        new Date(depTimeStr),
        legDurations,
      );

      // Điền Thời gian dự kiến đến (Tổng chuyến)
      setValue(
        "expectedArrivalTime",
        formatDateTimeForInput(schedule.expectedArrivalTime),
        { shouldValidate: true, shouldDirty: true },
      );

      // Điền thời gian cho các Trạm
      schedule.stops.forEach((stopTime, idx) => {
        setValue(
          `route.stops.${idx}.expectedArrivalTime`,
          formatDateTimeForInput(stopTime.expectedArrivalTime),
          { shouldValidate: true, shouldDirty: true },
        );
        setValue(
          `route.stops.${idx}.expectedDepartureTime`,
          formatDateTimeForInput(stopTime.expectedDepartureTime),
          { shouldValidate: true, shouldDirty: true },
        );
      });

      toast.success("Tính toán lịch trình tự động thành công! ⚡");
    } catch (error: any) {
      toast.error(error.message || "Lỗi kết nối máy chủ bản đồ.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* THỜI GIAN KHỞI HÀNH & ĐẾN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="obtp-field">
          <label className="obtp-label">Thời gian khởi hành *</label>
          <Input type="datetime-local" {...register("departureTime")} />
          {errors.departureTime && (
            <p className="text-red-500 text-sm mt-1">
              {(errors.departureTime as any).message}
            </p>
          )}
        </div>

        <div className="obtp-field">
          <label className="obtp-label">Thời gian dự kiến đến *</label>
          <Input type="datetime-local" {...register("expectedArrivalTime")} />
          {errors.expectedArrivalTime && (
            <p className="text-red-500 text-sm mt-1">
              {(errors.expectedArrivalTime as any).message}
            </p>
          )}
        </div>
      </div>

      {/* DANH SÁCH TRẠM DỪNG */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center">
              <MapPin size={20} className="mr-2 text-blue-500" />
              Trạm dừng trung gian (Tùy chọn)
            </h3>
            <p className="text-sm text-slate-500">
              Thêm các điểm xe sẽ ghé qua đón/trả khách trên đường đi
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoCalculate}
              disabled={isCalculating}
              className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30"
            >
              {isCalculating ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Zap size={16} className="mr-2" fill="currentColor" />
              )}
              {isCalculating ? "Đang tính..." : "Tự động tính thời gian"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  locationId: "",
                  expectedArrivalTime: "",
                  expectedDepartureTime: "",
                })
              }
            >
              <Plus size={16} className="mr-2" /> Thêm trạm
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
            Chuyến đi sẽ chạy thẳng, không có trạm dừng trung gian.
            <br />
            <span className="text-xs mt-2 inline-block">
              (Gợi ý: Nhấn <b>"Tự động tính thời gian"</b> để tính nhanh giờ đến
              đích)
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative"
              >
                <div className="absolute top-4 right-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    title="Xóa trạm"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </Button>
                </div>

                <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">
                  Trạm {index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="obtp-field">
                    <label className="obtp-label text-xs">
                      Chọn địa điểm dừng
                    </label>
                    <select
                      {...register(`route.stops.${index}.locationId` as const)}
                      className="obtp-input text-sm"
                    >
                      <option value="" disabled>
                        -- Chọn trạm --
                      </option>
                      {locations.map((loc) => (
                        <option
                          key={loc.id}
                          value={loc.id}
                          disabled={
                            loc.id === fromLocationId || loc.id === toLocationId
                          }
                        >
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    {(errors?.route as any)?.stops?.[index]?.locationId && (
                      <p className="text-red-500 text-xs mt-1">
                        {(errors.route as any).stops[index].locationId.message}
                      </p>
                    )}
                  </div>

                  <div className="obtp-field">
                    <label className="obtp-label text-xs">
                      Giờ đến (dự kiến)
                    </label>
                    <Input
                      type="datetime-local"
                      className="text-sm"
                      {...register(
                        `route.stops.${index}.expectedArrivalTime` as const,
                      )}
                    />
                    {(errors?.route as any)?.stops?.[index]
                      ?.expectedArrivalTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {
                          (errors.route as any).stops[index].expectedArrivalTime
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <div className="obtp-field">
                    <label className="obtp-label text-xs">
                      Giờ đi (dự kiến)
                    </label>
                    <Input
                      type="datetime-local"
                      className="text-sm"
                      {...register(
                        `route.stops.${index}.expectedDepartureTime` as const,
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
