import { useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";
import { LocationAutocomplete } from "../LocationAutocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@obtp/api-client";
import { calculateScheduleTimestamps } from "@/utils/schedule-calculator";
import type { GeoPoint } from "@obtp/shared-types";
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
  const stops = watch("route.stops") || [];

  /**
   * Logic Tự động tính toán lịch trình dựa trên bản đồ
   */
  const handleAutoCalculate = async () => {
    const values = getValues();
    const depTimeStr = values.departureTime;
    const fromId = values.route?.fromLocationId;
    const toId = values.route?.toLocationId;
    const currentStops = values.route?.stops || [];

    if (!depTimeStr)
      return toast.error("Vui lòng chọn Thời gian khởi hành trước.");
    if (!fromId || !toId)
      return toast.error("Vui lòng chọn Điểm đi và Điểm đến ở Bước 1.");

    const fromLoc = locations.find((l) => l.id === fromId || l._id === fromId);
    const toLoc = locations.find((l) => l.id === toId || l._id === toId);

    if (!fromLoc || !toLoc)
      return toast.error("Lỗi: Không tìm thấy tọa độ địa điểm gốc.");

    try {
      setIsCalculating(true);
      const waypoints: GeoPoint[] = [];

      waypoints.push({
        lat: fromLoc.location.coordinates[1],
        lng: fromLoc.location.coordinates[0],
      });

      for (let i = 0; i < currentStops.length; i++) {
        const stopId = currentStops[i].locationId;
        if (!stopId)
          return toast.error(`Trạm dừng số ${i + 1} chưa chọn địa điểm.`);

        const stopLoc = locations.find(
          (l) => l.id === stopId || l._id === stopId,
        );
        if (!stopLoc)
          return toast.error(`Không tìm thấy tọa độ trạm dừng ${i + 1}.`);

        waypoints.push({
          lat: stopLoc.location.coordinates[1],
          lng: stopLoc.location.coordinates[0],
        });
      }

      waypoints.push({
        lat: toLoc.location.coordinates[1],
        lng: toLoc.location.coordinates[0],
      });

      const res = await api.maps.calculateRoute({ waypoints });
      const legDurations = res.legDurations || [res.duration];

      const schedule = calculateScheduleTimestamps(
        new Date(depTimeStr),
        legDurations,
      );

      setValue(
        "expectedArrivalTime",
        formatDateTimeForInput(schedule.expectedArrivalTime),
        { shouldDirty: true },
      );

      schedule.stops.forEach((stopTime, idx) => {
        setValue(
          `route.stops.${idx}.expectedArrivalTime`,
          formatDateTimeForInput(stopTime.expectedArrivalTime),
          { shouldDirty: true },
        );
        setValue(
          `route.stops.${idx}.expectedDepartureTime`,
          formatDateTimeForInput(stopTime.expectedDepartureTime),
          { shouldDirty: true },
        );
      });

      toast.success(
        "Đã cập nhật lịch trình tự động dựa trên dữ liệu giao thông! ⚡",
      );
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
          <label className="obtp-label font-bold">Thời gian khởi hành *</label>
          <Input type="datetime-local" {...register("departureTime")} />
          {errors.departureTime && (
            <p className="text-red-500 text-xs mt-1">
              {(errors.departureTime as any).message}
            </p>
          )}
        </div>

        <div className="obtp-field">
          <label className="obtp-label font-bold">
            Thời gian dự kiến đến *
          </label>
          <Input type="datetime-local" {...register("expectedArrivalTime")} />
          {errors.expectedArrivalTime && (
            <p className="text-red-500 text-xs mt-1">
              {(errors.expectedArrivalTime as any).message}
            </p>
          )}
        </div>
      </div>

      {/* DANH SÁCH TRẠM DỪNG TRUNG GIAN */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" />
              Trạm dừng trung gian
            </h3>
            <p className="text-sm text-slate-500">
              Thiết lập các điểm đón/trả khách dọc đường
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoCalculate}
              disabled={isCalculating}
              className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
            >
              {isCalculating ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Zap size={16} className="mr-2" fill="currentColor" />
              )}
              Tính lịch trình tự động
            </Button>

            <Button
              type="button"
              variant="default"
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
          <div className="text-center p-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 bg-slate-50/30">
            Chuyến đi chạy thẳng, không có trạm dừng trung gian.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const otherStopIds = stops
                .map((s: any, idx: number) =>
                  idx !== index ? s.locationId : null,
                )
                .filter(Boolean);

              const excludeIds = [
                fromLocationId,
                toLocationId,
                ...otherStopIds,
              ].filter(Boolean);

              return (
                <div
                  key={field.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group animate-in slide-in-from-right-2"
                >
                  <div className="absolute top-4 right-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                    {/* CHỌN ĐỊA ĐIỂM (Autocomplete) */}
                    <div className="lg:col-span-4">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
                        Trạm dừng {index + 1} *
                      </label>
                      <Controller
                        name={`route.stops.${index}.locationId`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <LocationAutocomplete
                            locations={locations}
                            value={value}
                            onChange={onChange}
                            placeholder="Tìm địa điểm..."
                            excludeIds={excludeIds}
                            error={
                              (errors?.route as any)?.stops?.[index]?.locationId
                                ?.message
                            }
                          />
                        )}
                      />
                    </div>

                    {/* GIỜ ĐẾN */}
                    <div className="lg:col-span-4">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
                        Giờ đến dự kiến
                      </label>
                      <Input
                        type="datetime-local"
                        {...register(
                          `route.stops.${index}.expectedArrivalTime`,
                        )}
                      />
                      {(errors?.route as any)?.stops?.[index]
                        ?.expectedArrivalTime && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {
                            (errors.route as any).stops[index]
                              .expectedArrivalTime.message
                          }
                        </p>
                      )}
                    </div>

                    {/* GIỜ ĐI */}
                    <div className="lg:col-span-4">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
                        Giờ đi dự kiến
                      </label>
                      <Input
                        type="datetime-local"
                        {...register(
                          `route.stops.${index}.expectedDepartureTime`,
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
