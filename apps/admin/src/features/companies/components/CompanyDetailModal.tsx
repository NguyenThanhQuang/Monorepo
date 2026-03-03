import { X, Mail, Phone, MapPin, Building2, Calendar, Users, Bus, Star, DollarSign, Clock } from 'lucide-react';
import type { CompanyStatsResponse } from '@obtp/shared-types';
import { CompanyStatus } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CompanyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyStatsResponse;
}

export function CompanyDetailModal({ isOpen, onClose, company }: CompanyDetailModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const statusConfig = {
    [CompanyStatus.ACTIVE]: { 
      label: t('companyStatusActive'), 
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
    },
    [CompanyStatus.PENDING]: { 
      label: t('companyStatusPending'), 
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' 
    },
    [CompanyStatus.SUSPENDED]: { 
      label: t('companyStatusSuspended'), 
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' 
    },
    [CompanyStatus.INACTIVE]: { 
      label: t('companyStatusInactive'), 
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400' 
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '0₫';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} ${t('billion')}`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} ${t('million')}`;
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(t('locale') === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('companyDetails')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header với logo và tên */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {company.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {company.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('companyCode')}: {company.code}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[company.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                  {statusConfig[company.status]?.label || t('unknown')}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('email')}</p>
                <p className="text-gray-900 dark:text-white">{company.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('phone')}</p>
                <p className="text-gray-900 dark:text-white">{company.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('address')}</p>
                <p className="text-gray-900 dark:text-white">{company.address || '-'}</p>
              </div>
            </div>
          </div>

          {/* Thống kê chi tiết */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('activityStats')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-purple-600 dark:text-purple-400">{t('company')}</span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">1</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">{t('vehicles')}</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {company.totalTrips ? Math.ceil(company.totalTrips / 10) : 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">{t('trips')}</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {company.totalTrips || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">{t('passengers')}</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">0</p>
              </div>
            </div>
          </div>

          {/* Doanh thu và đánh giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">{t('totalRevenue')}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(company.totalRevenue || 0)}
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">{t('averageRating')}</span>
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {company.averageRating ? company.averageRating.toFixed(1) : '5.0'}
                </p>
                <span className="text-orange-600 dark:text-orange-400 mb-1">/5</span>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {company.description && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('description')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {company.description}
              </p>
            </div>
          )}

          {/* Thông tin thêm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('createdAt')}</p>
                <p className="text-gray-900 dark:text-white">{formatDate(company.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('lastUpdated')}</p>
                <p className="text-gray-900 dark:text-white">{formatDate(company.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}