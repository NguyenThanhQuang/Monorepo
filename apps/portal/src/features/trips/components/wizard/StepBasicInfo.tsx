import { useFormContext, Controller } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";
import { LocationAutocomplete } from "../LocationAutocomplete";

export function StepBasicInfo() {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const { vehicles, locations } = useTripDependencies();

  const fromLocationId = watch("route.fromLocationId");
  const toLocationId = watch("route.toLocationId");
  const stops = watch("route.stops") || [];

  const stopIds = stops.map((s: any) => s.locationId).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* PHẦN 1: CHỌN PHƯƠNG TIỆN */}
      <div className="obtp-field">
        <label className="obtp-label font-black text-slate-700">
          Chọn xe thực hiện chuyến đi *
        </label>
        <select
          {...register("vehicleId")}
          className="obtp-input cursor-pointer h-12"
        >
          <option value="" disabled>
            -- Vui lòng chọn xe đang sẵn sàng --
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicleNumber} - {v.type} ({v.totalSeats} chỗ ngồi)
            </option>
          ))}
        </select>
        {errors.vehicleId && (
          <p className="text-red-500 text-sm mt-1 font-medium">
            {(errors.vehicleId as any).message}
          </p>
        )}
      </div>

      {/* PHẦN 2: ĐỊA ĐIỂM ĐI & ĐẾN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* ĐIỂM KHỞI HÀNH */}
        <div className="obtp-field">
          <label className="obtp-label font-black text-slate-700">
            Điểm khởi hành *
          </label>
          <Controller
            name="route.fromLocationId"
            control={control}
            render={({ field }) => (
              <LocationAutocomplete
                locations={locations}
                value={field.value}
                onChange={field.onChange}
                placeholder="Tìm bến xe/tỉnh khởi hành..."
                excludeIds={[toLocationId, ...stopIds].filter(Boolean)}
                error={(errors.route as any)?.fromLocationId?.message}
              />
            )}
          />
        </div>

        {/* ĐIỂM ĐẾN */}
        <div className="obtp-field">
          <label className="obtp-label font-black text-slate-700">
            Điểm đến *
          </label>
          <Controller
            name="route.toLocationId"
            control={control}
            render={({ field }) => (
              <LocationAutocomplete
                locations={locations}
                value={field.value}
                onChange={field.onChange}
                placeholder="Tìm bến xe/tỉnh kết thúc..."
                excludeIds={[fromLocationId, ...stopIds].filter(Boolean)}
                error={(errors.route as any)?.toLocationId?.message}
              />
            )}
          />
        </div>
      </div>

      {/* CẤU HÌNH CHUYẾN MẪU */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4">
        <div className="flex items-start space-x-3">
          <div className="pt-0.5">
            <input
              type="checkbox"
              id="isRecurrenceTemplate"
              {...register("isRecurrenceTemplate")}
              className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 cursor-pointer transition-all"
            />
          </div>
          <label
            htmlFor="isRecurrenceTemplate"
            className="flex flex-col cursor-pointer select-none"
          >
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Lưu làm chuyến đi mẫu
            </span>
            <span className="text-xs text-slate-500 mt-1 leading-relaxed">
              Nếu bật, hệ thống sẽ tự động tạo chuyến đi này lặp lại hàng ngày
              vào khung giờ đã chọn. Phù hợp cho các tuyến cố định.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
