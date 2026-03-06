import { RefreshCw, DollarSign, Ticket, Users, Building2, TrendingUp } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center max-w-md mx-auto">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {t("errorFetchingDashboard")}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("dashboardTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("welcomeBack")}, {user?.name || t("admin")}!
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
       
         

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("totalBookings")}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalBookings)}
          </p>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
            {t("today")}: {formatNumber(stats.todayBookings)}
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("userManagement")}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalUsers)}
          </p>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
            {t("systemCustomers")}
          </p>
        </div>

        {/* Companies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("company")}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalCompanies)}
          </p>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
            {t("newToday")}: {formatNumber(stats.newCompaniesToday)}
          </p>
        </div>
      </div>

      {/* Active Trips Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("activeTrips")}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.activeTrips)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}