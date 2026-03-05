import React from "react";
import { Filter, Eye, DollarSign } from "lucide-react";
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
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
            <tr className="text-xs font-black text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5">{t("company")}</th>
              <th className="px-6 py-5 text-right">{t("totalBookings")}</th>
              <th className="px-6 py-5 text-right">Doanh thu</th>
              <th className="px-6 py-5 text-right text-blue-600 dark:text-blue-400">Hoa hồng (10%)</th>
              <th className="px-6 py-5 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.companyId} className="group hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all">
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      {item.companyName}
                    </div>
                    <div className="text-xs text-gray-400 font-mono italic">{item.companyCode}</div>
                  </td>
                  <td className="px-6 py-5 text-right font-medium dark:text-gray-300">
                    {formatNumber(item.totalBookings)} vé
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculatePlatformCommission(item.totalRevenue))}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onViewDetail(item)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  {t("noRevenueData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};