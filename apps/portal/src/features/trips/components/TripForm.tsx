import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTripSchema } from "@obtp/validation";
import type { CreateTripPayload } from "@obtp/shared-types";
import { useAuthStore } from "../../../core/auth/auth-store";
import { useLocations } from "../../../shared/hooks/use-common-queries";
import { useVehicles } from "../../vehicles/hooks/use-vehicles";
import { SearchSelect } from "../../../shared/components/ui/search-select";
import { FormControl } from "../../../shared/components/ui/form-control";
import { Input } from "../../../shared/components/ui/input";
import { Button } from "../../../shared/components/ui/button";

interface TripFormProps {
  onSubmit: (data: CreateTripPayload) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const TripForm = ({ onSubmit, onCancel, isLoading }: TripFormProps) => {
  const companyId = useAuthStore((s) => s.user?.companyId || "");

  const { data: locations } = useLocations();
  const { data: vehicles } = useVehicles();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTripPayload>({
    resolver: zodResolver(CreateTripSchema as any),
    defaultValues: {
      companyId: companyId,
      vehicleId: "",
      price: 0,
      isRecurrenceTemplate: false,
      route: { fromLocationId: "", toLocationId: "", stops: [] },
      departureTime: "",
      expectedArrivalTime: "",
    },
  });

  const locOptions =
    locations?.map((l: any) => ({
      value: l.id || l._id,
      label: l.name,
      subLabel: l.province,
    })) || [];

  const vehicleOptions =
    vehicles?.map((v: any) => ({
      value: v.id || v._id,
      label: v.vehicleNumber,
      subLabel: `${v.totalSeats} ghế`,
    })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("companyId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* === SECTION 1: LỘ TRÌNH === */}
        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
          <h4 className="font-semibold text-slate-800">
            1. Thông tin Lộ trình
          </h4>

          <SearchSelect
            label="Chọn xe vận hành"
            options={vehicleOptions}
            error={errors.vehicleId?.message}
            {...register("vehicleId")}
          />

          <div className="grid grid-cols-2 gap-4">
            <SearchSelect
              label="Điểm đi"
              options={locOptions}
              error={errors.route?.fromLocationId?.message}
              {...register("route.fromLocationId")}
            />
            <SearchSelect
              label="Điểm đến"
              options={locOptions}
              error={errors.route?.toLocationId?.message}
              {...register("route.toLocationId")}
            />
          </div>
        </div>

        {/* === SECTION 2: THỜI GIAN & GIÁ === */}
        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
          <h4 className="font-semibold text-slate-800">2. Thời gian & Giá</h4>

          <div className="grid grid-cols-2 gap-4">
            <FormControl
              label="Giờ khởi hành"
              error={errors.departureTime?.message}
            >
              <Input type="datetime-local" {...register("departureTime")} />
            </FormControl>
            <FormControl
              label="Giờ đến dự kiến"
              error={errors.expectedArrivalTime?.message}
            >
              <Input
                type="datetime-local"
                {...register("expectedArrivalTime")}
              />
            </FormControl>
          </div>

          <FormControl label="Giá vé (VNĐ)" error={errors.price?.message}>
            <Input
              type="number"
              placeholder="Ví dụ: 200000"
              {...register("price", { valueAsNumber: true })}
            />
          </FormControl>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              {...register("isRecurrenceTemplate")}
              id="recurrence"
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="recurrence" className="text-sm text-slate-700">
              Tạo làm chuyến mẫu (Lặp lại hàng ngày)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Tạo Chuyến Đi
        </Button>
      </div>
    </form>
  );
};
