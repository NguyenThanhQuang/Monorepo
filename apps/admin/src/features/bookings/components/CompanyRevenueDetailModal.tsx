import React from "react";
import { X, Building2, DollarSign, PieChart, Info, CheckCircle, Calendar, TrendingUp, Receipt, Ticket } from "lucide-react";
import { formatCurrency, formatNumber, calculatePlatformCommission, calculateCompanyNetRevenue } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CompanyRevenueStats } from "@obtp/shared-types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: CompanyRevenueStats | null;
}

export const CompanyRevenueDetailModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const { t } = useLanguage();
  
  if (!isOpen || !data) return null;

  const commission = calculatePlatformCommission(data.totalRevenue);
  const netRevenue = calculateCompanyNetRevenue(data.totalRevenue);
  const averagePerBooking = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl shadow-2xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 lg:p-6 flex items-center justify-between rounded-t-2xl lg:rounded-t-3xl z-10">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <div className="p-2 lg:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl shrink-0">
              <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                {data.companyName}
              </h2>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                {t("companyCode")}: {data.companyCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Receipt className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-[10px] lg:text-xs font-medium uppercase tracking-wider">{t("totalRevenue")}</span>
              </div>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <PieChart className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-[10px] lg:text-xs font-medium uppercase tracking-wider">{t("commission")} (10%)</span>
              </div>
              <p className="text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400 break-words">
                {formatCurrency(commission)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-[10px] lg:text-xs font-medium uppercase tracking-wider">{t("netRevenue")}</span>
              </div>
              <p className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400 break-words">
                {formatCurrency(netRevenue)}
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Ticket className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-[10px] lg:text-xs font-medium uppercase tracking-wider">{t("totalBookings")}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.totalBookings)}
                </p>
                <p className="text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                  ~{formatCurrency(Math.round(averagePerBooking))}/{t("ticket").toLowerCase()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-[10px] lg:text-xs font-medium uppercase tracking-wider">{t("performance")}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 w-full h-1.5 lg:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min((data.totalBookings / 100) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {data.totalBookings} {t("bookings")}
                </span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-amber-100 dark:border-amber-900/30">
            <div className="flex gap-3">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs lg:text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">{t("paymentInfo")}</p>
                <p>{t("paymentInfoDesc")}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm lg:text-base"
            >
              {t("close")}
            </button>
            <button
              className="w-full sm:flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-sm lg:text-base"
            >
              {t("viewTransactionDetails")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};