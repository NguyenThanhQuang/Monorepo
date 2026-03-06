import { useState, useEffect } from "react";
import {
  useForm,
  FormProvider,
  type Resolver,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { CreateTripSchema } from "@obtp/validation";
import type { CreateTripPayload } from "@obtp/shared-types";
import { useCreateTrip } from "../../api/useCreateTrip";
import { useTripDependencies } from "../../api/useTripDependencies";
import { useTripDetail } from "../../api/useTripDetail";
import { useTripMutations } from "../../api/useTripMutations";
import { Button } from "@/components/ui/button";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepSchedule } from "./StepSchedule";
import { StepPricing } from "./StepPricing";
import { StepPreview } from "./StepPreview";

type StepConfig = {
  id: string;
  title: string;
  component: React.FC;
  fields: Path<CreateTripPayload>[];
};

const STEPS: StepConfig[] = [
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
    fields: ["departureTime", "expectedArrivalTime"],
  },
  { id: "pricing", title: "Giá vé", component: StepPricing, fields: ["price"] },
  { id: "preview", title: "Xem trước", component: StepPreview, fields: [] },
];

const formatDateTimeForInput = (isoString?: string | Date) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export function TripFormWizard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [activeStep, setActiveStep] = useState(0);

  const { isLoading: isDepLoading, companyId } = useTripDependencies();
  const { data: tripData, isLoading: isTripLoading } = useTripDetail(id);

  const createTripMutation = useCreateTrip();
  const { updateTrip } = useTripMutations();

  const methods = useForm<CreateTripPayload>({
    resolver: zodResolver(
      CreateTripSchema,
    ) as unknown as Resolver<CreateTripPayload>,
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

  const { handleSubmit, trigger, reset } = methods;

  useEffect(() => {
    if (isEditMode && tripData) {
      reset({
        companyId: companyId || "",
        vehicleId: tripData.vehicleId?._id || tripData.vehicleId || "",
        price: tripData.price,
        isRecurrenceTemplate: tripData.isRecurrenceTemplate || false,
        departureTime: formatDateTimeForInput(tripData.departureTime),
        expectedArrivalTime: formatDateTimeForInput(
          tripData.expectedArrivalTime,
        ),
        route: {
          fromLocationId:
            tripData.route?.fromLocationId?._id ||
            tripData.route?.fromLocationId ||
            "",
          toLocationId:
            tripData.route?.toLocationId?._id ||
            tripData.route?.toLocationId ||
            "",
          stops: (tripData.route?.stops || []).map((stop: any) => ({
            locationId: stop.locationId?._id || stop.locationId,
            expectedArrivalTime: formatDateTimeForInput(
              stop.expectedArrivalTime,
            ),
            expectedDepartureTime: formatDateTimeForInput(
              stop.expectedDepartureTime,
            ),
          })),
        },
      });
    }
  }, [isEditMode, tripData, reset, companyId]);

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldsToValidate = STEPS[activeStep].fields;
    if (fieldsToValidate.length === 0) {
      if (activeStep < STEPS.length - 1) setActiveStep((prev) => prev + 1);
      return;
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid && activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const onSubmitForm = (data: CreateTripPayload) => {
    if (isEditMode && id) {
      updateTrip.mutate(
        {
          id: id,
          payload: {
            price: data.price,
            departureTime: data.departureTime,
            expectedArrivalTime: data.expectedArrivalTime,
            isRecurrenceActive: data.isRecurrenceTemplate,
          },
        },
        {
          onSuccess: () => navigate("/company/trips"),
        },
      );
    } else {
      createTripMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Tạo chuyến đi thành công!");
          navigate("/company/trips");
        },
        onError: (err: any) => {
          toast.error(err.message || "Không thể tạo chuyến đi");
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  if (isDepLoading || (isEditMode && isTripLoading)) {
    return (
      <div className="p-12 text-center text-slate-500">
        Đang tải dữ liệu cấu hình hệ thống...
      </div>
    );
  }

  if (isDepLoading || (isEditMode && isTripLoading)) {
    return (
      <div className="p-12 text-center text-slate-500">
        Đang tải dữ liệu cấu hình hệ thống...
      </div>
    );
  }

  const CurrentStepComponent = STEPS[activeStep].component;
  const isPending = createTripMutation.isPending || updateTrip.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/company/trips")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-black">
              {isEditMode ? "Chỉnh sửa chuyến đi" : "Tạo chuyến đi mới"}
            </h1>
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

      <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        ></div>
      </div>

      {isEditMode && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm border border-amber-200">
          <strong>Lưu ý:</strong> Đối với chuyến đi đã tạo, hệ thống chỉ cho
          phép cập nhật <b>Giờ khởi hành, Giờ đến và Giá vé</b>. Việc thay đổi
          Biển số xe hoặc Lộ trình sẽ không có tác dụng. Nếu cần đổi xe, vui
          lòng Hủy chuyến và tạo lại.
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          onKeyDown={handleKeyDown}
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
              disabled={activeStep === 0 || isPending}
            >
              Quay lại
            </Button>

            {activeStep === STEPS.length - 1 ? (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isPending}
              >
                {isPending
                  ? "Đang xử lý..."
                  : isEditMode
                    ? "Lưu thay đổi"
                    : "Xác nhận & Tạo chuyến"}
                {!isPending &&
                  (isEditMode ? (
                    <Save size={18} className="ml-2" />
                  ) : (
                    <CheckCircle size={18} className="ml-2" />
                  ))}
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
