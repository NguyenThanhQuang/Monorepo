import { useFormContext, useFieldArray } from "react-hook-form";
import { useTripDependencies } from "../../api/useTripDependencies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";

export function StepSchedule() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { locations } = useTripDependencies();

  // Hook xịn xò của RHF để quản lý mảng dữ liệu (trạm dừng)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "route.stops",
  });

  const fromLocationId = watch("route.fromLocationId");
  const toLocationId = watch("route.toLocationId");

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center">
              <MapPin size={20} className="mr-2 text-blue-500" />
              Trạm dừng trung gian (Tùy chọn)
            </h3>
            <p className="text-sm text-slate-500">
              Thêm các điểm xe sẽ ghé qua đón/trả khách trên đường đi
            </p>
          </div>
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

        {fields.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
            Chuyến đi sẽ chạy thẳng, không có trạm dừng trung gian.
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
                          // Trạm dừng không được là điểm đi và điểm đến
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
