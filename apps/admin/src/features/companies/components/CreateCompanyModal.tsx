// src/features/companies/components/CreateCompanyModal.tsx
import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import type { CreateCompanyPayload } from '@obtp/shared-types';
import { CompanyStatus } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyPayload) => Promise<void>;
  loading: boolean;
}

export function CreateCompanyModal({ isOpen, onClose, onSubmit, loading }: CreateCompanyModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateCompanyPayload>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    logoUrl: '',
    status: CompanyStatus.PENDING,
    adminName: '',
    adminEmail: '',
    adminPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('errorCompanyNameRequired');
    }

    if (!formData.code.trim()) {
      newErrors.code = t('errorCompanyCodeRequired');
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = t('errorCompanyCodeFormat');
    }

    if (!formData.email?.trim()) {
      newErrors.email = t('errorEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errorEmailInvalid');
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = t('errorPhoneRequired');
    } else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('errorPhoneInvalid');
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = t('errorAdminNameRequired');
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = t('errorAdminEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = t('errorEmailInvalid');
    }

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = t('errorAdminPhoneRequired');
    } else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(formData.adminPhone.replace(/\s/g, ''))) {
      newErrors.adminPhone = t('errorPhoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      logoUrl: '',
      status: CompanyStatus.PENDING,
      adminName: '',
      adminEmail: '',
      adminPhone: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('addNewCompany')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin nhà xe */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('companyInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('companyName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('companyNamePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('companyCode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white uppercase ${
                    errors.code ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('companyCodePlaceholder')}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('phonePlaceholder')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  placeholder={t('addressPlaceholder')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('logoUrl')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    placeholder={t('logoUrlPlaceholder')}
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

          {/* Thông tin quản trị viên */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('adminInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.adminName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('adminNamePlaceholder')}
                />
                {errors.adminName && (
                  <p className="mt-1 text-sm text-red-500">{errors.adminName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.adminEmail ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('emailPlaceholder')}
                />
                {errors.adminEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.adminEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.adminPhone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder={t('phonePlaceholder')}
                />
                {errors.adminPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.adminPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? t('processing') : t('createCompany')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}