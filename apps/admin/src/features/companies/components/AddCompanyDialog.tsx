import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";
import { createCompanySchema, updateCompanySchema } from "@obtp/validation";
import {
  CompanyStatus,
  type CompanyStatsResponse,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "@obtp/shared-types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner } from "@/components/ui/Spinner";

interface TotalCompanyFormValues extends CreateCompanyPayload {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}
interface AddCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: CreateCompanyPayload | UpdateCompanyPayload,
    id?: string,
  ) => Promise<void>;
  companyToEdit?: CompanyStatsResponse | null;
  loading: boolean;
}

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  companyToEdit,
  loading,
}) => {
  const { t } = useLanguage();
  const isEditMode = Boolean(companyToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TotalCompanyFormValues>({
    resolver: zodResolver(
      isEditMode ? updateCompanySchema : createCompanySchema,
    ) as any,
    defaultValues: {
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      description: "",
      logoUrl: "",
      status: CompanyStatus.INACTIVE,
      adminName: "",
      adminEmail: "",
      adminPhone: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (companyToEdit) {
        reset({
          name: companyToEdit.name,
          code: companyToEdit.code,
          address: companyToEdit.address ?? "",
          phone: companyToEdit.phone ?? "",
          email: companyToEdit.email ?? "",
          description: companyToEdit.description ?? "",
          logoUrl: companyToEdit.logoUrl ?? "",
          status: companyToEdit.status,
        });
      } else {
        reset({
          name: "",
          code: "",
          address: "",
          phone: "",
          email: "",
          description: "",
          logoUrl: "",
          status: CompanyStatus.ACTIVE,
          adminName: "",
          adminEmail: "",
          adminPhone: "",
        });
      }
    }
  }, [isOpen, companyToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    if (isEditMode && companyToEdit) {
      await onSave(
        data as UpdateCompanyPayload,
        companyToEdit.id || companyToEdit._id,
      );
    } else {
      await onSave(data as CreateCompanyPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl">
        {/* Header Modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t("editCompany") : t("addNewCompany")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Group 1: Company Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t("companyInformation")}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Tên nhà xe */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("companyName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder={t("companyNamePlaceholder")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message?.toString()}
                  </p>
                )}
              </div>

              {/* Mã nhà xe (Chỉ cho phép sửa/nhập khi tạo mới - Hoặc cho phép Edit tùy requirement) */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("companyCode")}{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  {...register("code")}
                  disabled={isEditMode}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white uppercase ${
                    errors.code
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } ${isEditMode ? "opacity-60 cursor-not-allowed" : ""}`}
                  placeholder={t("companyCodePlaceholder")}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.code.message?.toString()}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("email")}
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder={t("emailPlaceholder")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message?.toString()}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.phone
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder={t("phonePlaceholder")}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone.message?.toString()}
                  </p>
                )}
              </div>

              {/* Trạng thái */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("status")}
                </label>
                <select
                  {...register("status")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                >
                  <option value={CompanyStatus.ACTIVE}>
                    {t("companyStatusActive")}
                  </option>
                  <option value={CompanyStatus.PENDING}>
                    {t("companyStatusPending")}
                  </option>
                  <option value={CompanyStatus.SUSPENDED}>
                    {t("companyStatusSuspended")}
                  </option>
                  <option value={CompanyStatus.INACTIVE}>
                    {t("companyStatusInactive")}
                  </option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.status.message?.toString()}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("address")}
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  placeholder={t("addressPlaceholder")}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("description")}
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>

              {/* Logo URL */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("logoUrl")}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    {...register("logoUrl")}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    placeholder={t("logoUrlPlaceholder")}
                  />
                  <button
                    type="button"
                    className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Admin Information (Chỉ hiện khi Create) */}
          {!isEditMode && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("adminInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Admin Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("adminName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("adminName")}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                      errors.adminName
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                    placeholder={t("adminNamePlaceholder")}
                  />
                  {errors.adminName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.adminName.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("adminEmail")}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                      errors.adminEmail
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                    placeholder={t("emailPlaceholder")}
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.adminEmail.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Admin Phone */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("adminPhone")}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                      errors.adminPhone
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                    placeholder={t("phonePlaceholder")}
                  />
                  {errors.adminPhone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.adminPhone.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end pt-6 space-x-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Spinner className="text-white" size={16} />}
              <span>
                {loading
                  ? t("processing")
                  : isEditMode
                    ? t("update")
                    : t("createCompany")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
