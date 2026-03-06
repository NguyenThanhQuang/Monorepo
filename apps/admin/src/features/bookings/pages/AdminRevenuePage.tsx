import { useState, useMemo } from "react";
import { RefreshCw, Download, Search, ChevronLeft, ChevronRight, Calendar, Filter, DollarSign, BarChart3, X } from "lucide-react";
import toast from "react-hot-toast";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRevenueStats } from "../hooks/useRevenueStats";
import { adminApi } from "@obtp/api-client";
import { calculatePlatformCommission, formatCurrency } from "@obtp/business-logic";

import { RevenueStatsCards } from "../components/RevenueStatsCards";
import { RevenueTable } from "../components/RevenueTable";
import { CompanyRevenueDetailModal } from "../components/CompanyRevenueDetailModal";
import type { CompanyRevenueStats } from "@obtp/shared-types";

export function AdminRevenuePage() {
  const { t } = useLanguage();
  
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({ start: firstDay, end: today });
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRevenueStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  const { data = [], isLoading, refetch, isRefetching } = useRevenueStats({
    fromDate: dateRange.start || undefined,
    toDate: dateRange.end || undefined,
  });

  const filteredData = useMemo(() => {
    return data.filter(item => 
      !searchTerm.trim() || 
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((sum, i) => sum + (i.totalRevenue || 0), 0);
    return {
      revenue: totalRevenue,
      bookings: data.reduce((sum, i) => sum + (i.totalBookings || 0), 0),
      companies: data.length,
      commission: calculatePlatformCommission(totalRevenue)
    };
  }, [data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = async () => {
    const toastId = toast.loading(t("exporting"));
    try {
      setIsExporting(true);
      const blob = await adminApi.exportRevenueReport({
        fromDate: dateRange.start || undefined,
        toDate: dateRange.end || undefined,
      });

      const url = window.URL.createObjectURL(new Blob([blob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bao_Cao_Doanh_Thu_OBTP_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(t("exportSuccess"), { id: toastId });
    } catch (err) {
      console.error("Export Error:", err);
      toast.error(t("exportError"), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateRange({ start: firstDay, end: today });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = dateRange.start !== firstDay || dateRange.end !== today || searchTerm;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8 space-y-4 lg:space-y-6 xl:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <div className="p-1.5 lg:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[10px] lg:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {t("revenueStatistics")}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
              {t("revenueStatistics")}
            </h1>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
              {t("revenueStatisticsDesc")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 lg:p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title={t("refresh")}
            >
              <RefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 lg:p-2.5 border rounded-xl transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 text-purple-600'
                  : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={t("filters")}
            >
              <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
              <span className="hidden sm:inline">{t("exportReport")}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <RevenueStatsCards
          totalRevenue={stats.revenue}
          totalBookings={stats.bookings}
          activeCompanies={stats.companies}
          totalCommission={stats.commission}
        />

        {/* Filters Section */}
        {(showFilters || hasActiveFilters) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{t("filters")}</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs lg:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>{t("clearFilters")}</span>
                </button>
              )}
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Range */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 lg:mb-2">
                    {t("fromDate")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg lg:rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 lg:mb-2">
                    {t("toDate")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg lg:rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 lg:mb-2">
                  {t("search")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("searchCompany")}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg lg:rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <RevenueTable
          data={paginatedData}
          onViewDetail={(item) => setSelectedCompany(item)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl border border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 lg:py-4">
            <p className="text-xs lg:text-sm text-gray-500 order-2 sm:order-1">
              {t("showing")} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} {t("of")} {filteredData.length} {t("items")}
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 lg:p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg font-medium text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 lg:p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {data.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
              <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{t("revenueSummary")}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("totalRevenue")}</p>
                <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white break-words">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("totalCommission")}</p>
                <p className="text-lg lg:text-xl xl:text-2xl font-bold text-blue-600 dark:text-blue-400 break-words">
                  {formatCurrency(stats.commission)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("averagePerCompany")}</p>
                <p className="text-lg lg:text-xl xl:text-2xl font-bold text-green-600 dark:text-green-400 break-words">
                  {formatCurrency(stats.companies > 0 ? stats.revenue / stats.companies : 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <CompanyRevenueDetailModal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          data={selectedCompany}
        />
      </div>
    </div>
  );
}