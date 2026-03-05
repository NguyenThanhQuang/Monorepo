import React from "react";
import { DollarSign, Ticket, Building2, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  totalRevenue: number;
  totalBookings: number;
  activeCompanies: number;
}

export const RevenueStatsCards: React.FC<Props> = ({ totalRevenue, totalBookings, activeCompanies }) => {
  const { t } = useLanguage();

  const cardData = [
    {
      label: t("totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "purple",
    },
    {
      label: t("totalBookings"),
      value: formatNumber(totalBookings),
      icon: Ticket,
      color: "blue",
    },
    {
      label: t("activeCompanies") || "Nhà xe hoạt động",
      value: formatNumber(activeCompanies),
      icon: Building2,
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardData.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-2xl text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                {card.label}
              </p>
              <h2 className="text-2xl font-black dark:text-white tracking-tight">
                {card.value}
              </h2>
            </div>
          </div>
          <ArrowUpRight className={`absolute -right-2 -bottom-2 w-20 h-20 text-${card.color}-500/5 group-hover:text-${card.color}-500/10 transition-colors`} />
        </div>
      ))}
    </div>
  );
};