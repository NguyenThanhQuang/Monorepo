import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  Upload,
  Image as ImageIcon,
  Hash,
} from "lucide-react";
import { updateCompanySchema } from "@obtp/validation";
import type { UpdateCompanyPayload, CompanyResponse } from "@obtp/shared-types";
import { api } from "@obtp/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanySettings } from "../api/useCompanySettings";
import { toast } from "sonner";

interface Props {
  company: CompanyResponse;
}

export function CompanyProfileForm({ company }: Props) {
  const { updateCompany } = useCompanySettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateCompanyPayload>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company.name,
      code: company.code,
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      description: company.description || "",
      logoUrl: company.logoUrl || "",
    },
  });

  const currentLogo = watch("logoUrl");

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        code: company.code,
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        description: company.description || "",
        logoUrl: company.logoUrl || "",
      });
    }
  }, [company, reset]);

  /**
   * Xử lý tải ảnh lên Server
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.upload.uploadCompanyLogo(file);

      setValue("logoUrl", response.url, { shouldDirty: true });
      toast.success("Tải ảnh lên thành công!");
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /**
   * Submit toàn bộ hồ sơ
   */
  const onSubmit = (data: UpdateCompanyPayload) => {
    const { code, ...payload } = data as any;

    updateCompany.mutate({
      id: company.id,
      payload: payload,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in duration-500"
    >
      <div className="obtp-card obtp-card-strong p-6 mb-6">
        {/* Header của Form */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Building2 size={24} className="text-blue-600" />
              Thông tin Hồ sơ Nhà xe
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Cấu hình thông tin nhận diện thương hiệu trên hệ thống
            </p>
          </div>
          <Button
            type="submit"
            variant="default"
            disabled={!isDirty || updateCompany.isPending}
            className="min-w-[140px] shadow-lg shadow-blue-500/20"
          >
            {updateCompany.isPending ? (
              "Đang lưu..."
            ) : (
              <>
                <Save size={18} className="mr-2" /> Lưu thay đổi
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* CỘT TRÁI: QUẢN LÝ LOGO */}
          <div className="w-full lg:w-1/3 flex flex-col items-center space-y-6">
            <div className="text-center w-full">
              <label className="obtp-label mb-3 block text-center">
                Logo nhà xe
              </label>
              <div
                className="relative mx-auto w-56 h-56 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 group cursor-pointer hover:border-blue-500 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                {currentLogo ? (
                  <img
                    src={`${currentLogo}?t=${Date.now()}`}
                    alt="Company Logo"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200?text=Logo+Error";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <ImageIcon size={32} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">
                      Tải ảnh lên
                    </span>
                  </div>
                )}

                {/* Overlay khi hover hoặc đang upload */}
                <div
                  className={`absolute inset-0 bg-blue-600/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {isUploading ? (
                    <div className="text-white flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold uppercase">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    <div className="text-white flex flex-col items-center">
                      <Upload size={28} className="mb-1" />
                      <span className="text-xs font-black uppercase">
                        Thay đổi ảnh
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
              />

              <div className="mt-4 space-y-1">
                <p className="text-xs text-slate-500 font-medium">
                  Hỗ trợ định dạng: PNG, JPG, WEBP.
                </p>
                <p className="text-xs text-slate-400 italic">
                  Dung lượng tối đa: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên nhà xe */}
              <div className="obtp-field">
                <label className="obtp-label ">Tên nhà xe thương mại *</label>
                <div className="relative">
                  <Input
                    hasIcon
                    {...register("name")}
                    placeholder="Ví dụ: Hoàng Long Limousine"
                    className={
                      errors.name ? "border-red-500 focus:ring-red-500" : ""
                    }
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Mã nhà xe (Read Only) */}
              <div className="obtp-field">
                <label className="obtp-label">Mã định danh (Hệ thống)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                    <Hash size={16} />
                  </div>
                  <Input
                    hasIcon
                    {...register("code")}
                    disabled
                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 font-mono text-blue-600 dark:text-blue-400 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* Hotline */}
              <div className="obtp-field">
                <label className="obtp-label">Số điện thoại Hotline</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                    <Phone size={16} />
                  </div>
                  <Input
                    hasIcon
                    {...register("phone")}
                    className="pl-10"
                    placeholder="1900 xxxx hoặc 09xx..."
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="obtp-field">
                <label className="obtp-label">Email hỗ trợ khách hàng</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                    <Mail size={16} />
                  </div>
                  <Input
                    hasIcon
                    {...register("email")}
                    className="pl-10"
                    placeholder="support@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="obtp-field md:col-span-2">
                <label className="obtp-label">Địa chỉ văn phòng chính</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                    <MapPin size={16} />
                  </div>
                  <Input
                    hasIcon
                    {...register("address")}
                    className="pl-10"
                    placeholder="Số nhà, tên đường, quận/huyện..."
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Mô tả / Giới thiệu */}
              <div className="obtp-field md:col-span-2">
                <label className="obtp-label">
                  Giới thiệu về nhà xe & Quy định
                </label>

                <div className="obtp-textarea-container">
                  {" "}
                  <span className="obtp-textarea-icon">
                    {" "}
                    <FileText size={18} />
                  </span>
                  <textarea
                    {...register("description")}
                    className="obtp-input obtp-input-textarea min-h-[140px] py-3 resize-y w-full"
                    placeholder="Mô tả ngắn gọn về dịch vụ..."
                  />
                </div>

                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
