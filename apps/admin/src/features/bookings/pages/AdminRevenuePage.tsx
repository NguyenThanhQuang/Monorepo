import { useState, useMemo } from "react";
import {
  TrendingUp,
  RefreshCw,
  DollarSign,
  Building2,
  Ticket,
  Search,
  FileText,
  Calendar,
  Filter,
  ArrowUpRight,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useRevenueStats } from "../hooks/useRevenueStats";
import { adminApi } from "@obtp/api-client";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminRevenuePage() {
  const { t } = useLanguage();

  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({
    start: firstDayOfMonth,
    end: today,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRevenueStats({
    fromDate: dateRange.start,
    toDate: dateRange.end,
  });

  const handleAllTime = () => {
    setDateRange({ start: "", end: "" });
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.companyName.toLowerCase().includes(term) ||
          item.companyCode.toLowerCase().includes(term),
      );
    }
    return result;
  }, [data, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const stats = useMemo(() => {
    const totalRevenue = data.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0,
    );
    const totalBookings = data.reduce(
      (sum, item) => sum + (item.totalBookings || 0),
      0,
    );
    return { totalRevenue, totalBookings };
  }, [data]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminApi.exportRevenueReport({
        fromDate: dateRange.start,
        toDate: dateRange.end,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Doanh_Thu_OBTP.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("successExportReport") || "Xuất báo cáo thành công");
    } catch (err) {
      toast.error(t("exportError") || "Lỗi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("revenueStatistics")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("revenueStatisticsDesc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAllTime}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
          >
            <History size={16} />
            {t("allTimeRevenue") || "Tất cả thời gian"}
          </button>
          <button
            onClick={() => refetch()}
            className="p-2.5 text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 font-bold"
          >
            <FileText className="w-4 h-4" />
            {isExporting ? t("processing") || "Đang xử lý..." : "Excel"}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              {t("startDate") || "Từ ngày"}
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.start || ""}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, start: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              {t("endDate") || "Đến ngày"}
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.end || ""}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, end: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              {t("searchCompany") || "Tìm nhà xe..."}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("companyNamePlaceholder") || "Nhập tên nhà xe"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                {t("totalRevenue")}
              </p>
              <h2 className="text-2xl font-black dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-purple-500/5" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                {t("totalBookings")}
              </p>
              <h2 className="text-2xl font-black dark:text-white">
                {formatNumber(stats.totalBookings)}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-blue-500/5" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                {t("activeCompanies") || "Nhà xe hoạt động"}
              </p>
              <h2 className="text-2xl font-black dark:text-white">
                {filteredData.length}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-green-500/5" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-xs font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">{t("company")}</th>
                <th className="px-6 py-5 text-right">{t("totalBookings")}</th>
                <th className="px-6 py-5 text-right">{t("revenue")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr
                    key={item.companyId}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all cursor-default"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                        {item.companyName}
                      </div>
                      <div className="text-xs text-gray-400 font-mono tracking-tighter italic">
                        {item.companyCode}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium dark:text-gray-300">
                      {formatNumber(item.totalBookings)}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-lg text-purple-600 dark:text-purple-400">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-20 text-center text-gray-400 font-medium"
                  >
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    {t("noRevenueData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredData.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}