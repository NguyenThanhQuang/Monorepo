import React from "react";
import { Filter, Eye, TrendingUp, Calendar, Building2 } from "lucide-react";
import { formatCurrency, formatNumber, calculatePlatformCommission } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CompanyRevenueStats } from "@obtp/shared-types";

interface Props {
  data: CompanyRevenueStats[];
  onViewDetail: (item: CompanyRevenueStats) => void;
}

export const RevenueTable: React.FC<Props> = ({ data, onViewDetail }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Table Header */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>{t("revenueByCompany")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] lg:min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/30">
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">{t("company")}</th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">{t("totalBookings")}</th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">{t("totalRevenue")}</th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-blue-600">{t("commission")}</th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-center">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={item.companyId} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-start gap-2 lg:gap-3">
                      <div className="p-1.5 lg:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm lg:text-base text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors truncate max-w-[200px] lg:max-w-xs">
                          {item.companyName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.companyCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-white">
                      {formatNumber(item.totalBookings)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                    <span className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                    <span className="font-semibold text-sm lg:text-base text-blue-600 dark:text-blue-400">
                      {formatCurrency(calculatePlatformCommission(item.totalRevenue))}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onViewDetail(item)}
                        className="p-1.5 lg:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                        title={t("viewRevenueDetails")}
                      >
                        <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 lg:px-6 py-12 lg:py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Filter className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium">
                      {t("noRevenueData")}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {t("adjustFilters")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {data.length > 0 && (
        <div className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs lg:text-sm">
            <span className="text-gray-500">
              {t("showing")} <span className="font-medium text-gray-900 dark:text-white">{data.length}</span> {t("companies")}
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t("totalRevenue")}: {formatCurrency(data.reduce((sum, i) => sum + i.totalRevenue, 0))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};