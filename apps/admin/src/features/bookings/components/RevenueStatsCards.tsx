import React from "react";
import { DollarSign, Ticket, Building2, PieChart } from "lucide-react";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  totalRevenue: number;
  totalBookings: number;
  activeCompanies: number;
  totalCommission: number;
}

export const RevenueStatsCards: React.FC<Props> = ({ 
  totalRevenue, 
  totalBookings, 
  activeCompanies, 
  totalCommission 
}) => {
  const { t } = useLanguage();

  const cardData = [
    {
      key: "totalRevenue",
      label: t("totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
    },
    {
      key: "totalCommission",
      label: t("totalCommission"),
      value: formatCurrency(totalCommission),
      icon: PieChart,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      key: "totalBookings",
      label: t("totalBookings"),
      value: formatNumber(totalBookings),
      icon: Ticket,
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
    },
    {
      key: "activeCompanies",
      label: t("activeCompanies"),
      value: formatNumber(activeCompanies),
      icon: Building2,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cardData.map((card) => (
        <div
          key={card.key}
          className={`${card.bgColor} rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1 lg:space-y-2">
              <p className="text-[10px] lg:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className={`text-xl lg:text-2xl xl:text-3xl font-bold ${card.textColor} break-words`}>
                {card.value}
              </h3>
            </div>
            <div className={`${card.iconBg} p-2 lg:p-3 rounded-xl lg:rounded-2xl shrink-0`}>
              <card.icon className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};