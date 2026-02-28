import { useFormContext } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";

export function StepBasicInfo() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const { vehicles, locations } = useTripDependencies();

  const fromLocationId = watch("route.fromLocationId");
  const toLocationId = watch("route.toLocationId");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="obtp-field">
        <label className="obtp-label">Chọn xe thực hiện chuyến đi *</label>
        <select
          {...register("vehicleId")}
          className="obtp-input cursor-pointer"
        >
          <option value="" disabled>
            -- Vui lòng chọn xe --
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicleNumber} - {v.type} ({v.totalSeats} chỗ ngồi)
            </option>
          ))}
        </select>
        {errors.vehicleId && (
          <p className="text-red-500 text-sm mt-1">
            {(errors.vehicleId as any).message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="obtp-field">
          <label className="obtp-label">Điểm khởi hành *</label>
          <select
            {...register("route.fromLocationId")}
            className="obtp-input cursor-pointer"
          >
            <option value="" disabled>
              -- Chọn điểm đi --
            </option>
            {locations.map((loc) => (
              <option
                key={loc._id}
                value={loc._id}
                disabled={loc._id === toLocationId}
              >
                {loc.name} ({loc.province})
              </option>
            ))}
          </select>
          {(errors.route as any)?.fromLocationId && (
            <p className="text-red-500 text-sm mt-1">
              {(errors.route as any).fromLocationId.message}
            </p>
          )}
        </div>

        <div className="obtp-field">
          <label className="obtp-label">Điểm đến *</label>
          <select
            {...register("route.toLocationId")}
            className="obtp-input cursor-pointer"
          >
            <option value="" disabled>
              -- Chọn điểm đến --
            </option>
            {locations.map((loc) => (
              <option
                key={loc.id}
                value={loc.id}
                disabled={loc.id === fromLocationId}
              >
                {loc.name} ({loc.province})
              </option>
            ))}
          </select>
          {(errors.route as any)?.toLocationId && (
            <p className="text-red-500 text-sm mt-1">
              {(errors.route as any).toLocationId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <input
          type="checkbox"
          id="isRecurrenceTemplate"
          {...register("isRecurrenceTemplate")}
          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="isRecurrenceTemplate"
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          Lưu làm chuyến đi mẫu (Hệ thống sẽ tự động tạo chuyến này lặp lại hàng
          ngày)
        </label>
      </div>
    </div>
  );
}
