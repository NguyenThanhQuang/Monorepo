import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

export function StepPricing() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const priceValue = watch("price");

  const formatCurrency = (val: number) => {
    if (!val || isNaN(val)) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
          Thiết lập giá vé cơ bản
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Giá vé này sẽ áp dụng cho tất cả các ghế trên xe. Bạn có thể điều
          chỉnh phụ thu sau này
        </p>
      </div>

      <div className="obtp-field max-w-md">
        <label className="obtp-label">Giá vé (VNĐ) *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none obtp-input-icon top-icon">
            <DollarSign className="text-slate-400" size={18} />
          </div>
          <Input
            hasIcon
            type="number"
            className="pl-10 text-lg font-semibold"
            placeholder="0"
            min={0}
            {...register("price", { valueAsNumber: true })}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-slate-500 font-medium">VNĐ</span>
          </div>
        </div>

        {errors.price ? (
          <p className="text-red-500 text-sm mt-1">
            {(errors.price as any).message}
          </p>
        ) : (
          <p className="text-right text-sm text-slate-500 mt-2 font-medium">
            Hiển thị: {formatCurrency(priceValue)}
          </p>
        )}
      </div>
    </div>
  );
}
