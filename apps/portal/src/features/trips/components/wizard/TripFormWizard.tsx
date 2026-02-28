import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react";
import { CreateTripSchema } from "@obtp/validation";
import type { CreateTripPayload } from "@obtp/shared-types";
import { useCreateTrip } from "../../api/useCreateTrip";
import { useTripDependencies } from "../../api/useTripDependencies";
import { Button } from "@/components/ui/button";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepSchedule } from "./StepSchedule";
import { StepPricing } from "./StepPricing";
import { StepPreview } from "./StepPreview";

const STEPS = [
  {
    id: "basic",
    title: "Thông tin cơ bản",
    component: StepBasicInfo,
    fields: ["vehicleId", "route.fromLocationId", "route.toLocationId"],
  },
  {
    id: "schedule",
    title: "Lịch trình",
    component: StepSchedule,
    fields: ["departureTime", "expectedArrivalTime", "route.stops"],
  },
  {
    id: "pricing",
    title: "Giá vé",
    component: StepPricing,
    fields: ["price"],
  },
  {
    id: "preview",
    title: "Xem trước",
    component: StepPreview,
    fields: [],
  },
];

export function TripFormWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const { isLoading, companyId } = useTripDependencies();
  const createTripMutation = useCreateTrip();

  const methods = useForm<z.infer<typeof CreateTripSchema>>({
    resolver: zodResolver(CreateTripSchema),
    mode: "onChange",
    defaultValues: {
      companyId: companyId || "",
      vehicleId: "",
      route: { fromLocationId: "", toLocationId: "", stops: [] },
      departureTime: "",
      expectedArrivalTime: "",
      price: 0,
      isRecurrenceTemplate: false,
    },
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const fieldsToValidate = STEPS[activeStep].fields as any;

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (activeStep < STEPS.length - 1) {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const onSubmitForm = (data: CreateTripPayload) => {
    createTripMutation.mutate(data, {
      onSuccess: () => {
        alert("🎉 Tạo chuyến đi thành công!");
        navigate("/company/trips");
      },
      onError: (err: any) => {
        alert("❌ Lỗi: " + (err.message || "Không thể tạo chuyến đi"));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-slate-500">
        Đang tải dữ liệu cấu hình hệ thống...
      </div>
    );
  }

  const CurrentStepComponent = STEPS[activeStep].component;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Điều hướng */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/company/trips")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-black">Tạo chuyến đi mới</h1>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <span
                className={`font-bold mr-2 ${activeStep === STEPS.length - 1 ? "text-green-600" : "text-blue-600"}`}
              >
                Bước {activeStep + 1}/{STEPS.length}:
              </span>
              {STEPS[activeStep].title}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        ></div>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="obtp-card obtp-card-strong p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="min-h-[320px]">
            <CurrentStepComponent />
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={activeStep === 0 || createTripMutation.isPending}
            >
              Quay lại
            </Button>

            {activeStep === STEPS.length - 1 ? (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={createTripMutation.isPending}
              >
                {createTripMutation.isPending
                  ? "Đang xử lý..."
                  : "Xác nhận & Tạo chuyến"}
                {!createTripMutation.isPending && (
                  <CheckCircle size={18} className="ml-2" />
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Tiếp theo <ArrowRight size={18} className="ml-2" />
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
