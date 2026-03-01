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

  const [dateRange, setDateRange] = useState({
    start: firstDayOfMonth,
    end: today,
  });
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

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

  const filteredData = useMemo(() => {
    let result = [...data];
    if (selectedCompany !== "all") {
      result = result.filter((item) => item.companyId === selectedCompany);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.companyName.toLowerCase().includes(term) ||
          item.companyCode.toLowerCase().includes(term),
      );
    }
    return result;
  }, [data, selectedCompany, searchTerm]);

  const totalRevenue = useMemo(
    () => data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
    [data],
  );
  const totalBookings = useMemo(
    () => data.reduce((sum, item) => sum + (item.totalBookings || 0), 0),
    [data],
  );
  const averageRating = useMemo(() => {
    if (data.length === 0) return 0;
    return (
      data.reduce((sum, item) => sum + (item.averageRating || 0), 0) /
      data.length
    );
  }, [data]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminApi.exportRevenueReport({
        fromDate: dateRange.start,
        toDate: dateRange.end,
        companyId: selectedCompany !== "all" ? selectedCompany : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Doanh_Thu_${dateRange.start}_den_${dateRange.end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Xuất báo cáo thành công");
    } catch (err) {
      toast.error("Không thể xuất file báo cáo");
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
            Thống kê doanh thu
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Quản lý tài chính toàn hệ thống và từng nhà xe
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
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
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Từ ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, start: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Đến ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, end: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Lọc theo nhà xe
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium appearance-none"
              >
                <option value="all">Tất cả đơn vị</option>
                {data.map((c) => (
                  <option key={c.companyId} value={c.companyId}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên, mã nhà xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">TỔNG DOANH THU</p>
              <h2 className="text-2xl font-black dark:text-white">
                {formatCurrency(totalRevenue, true)}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-purple-500/5" />
        </div>

        {/* Tổng số vé */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">TỔNG VÉ BÁN RA</p>
              <h2 className="text-2xl font-black dark:text-white">
                {formatNumber(totalBookings)}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-blue-500/5" />
        </div>

        {/* Nhà xe hoạt động */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">
                NHÀ XE CÓ DOANH THU
              </p>
              <h2 className="text-2xl font-black dark:text-white">
                {filteredData.length}
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-green-500/5" />
        </div>

        {/* Đánh giá hệ thống */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">
                ĐIỂM HỆ THỐNG TB
              </p>
              <h2 className="text-2xl font-black dark:text-white">
                {averageRating.toFixed(1)} / 5.0
              </h2>
            </div>
          </div>
          <ArrowUpRight className="absolute -right-2 -bottom-2 w-20 h-20 text-orange-500/5" />
        </div>
      </div>

      {/* Main Table - Giữ nguyên layout tràn viền với rounded-3xl */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-xs font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">Đơn vị kinh doanh</th>
                <th className="px-6 py-5 text-right">Lượng vé</th>
                <th className="px-6 py-5 text-right">Tăng trưởng</th>
                <th className="px-6 py-5 text-right">Doanh thu ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.companyId}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all cursor-default"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                        {item.companyName}
                      </div>
                      <div className="text-xs text-gray-400 font-mono tracking-tighter">
                        REF-CODE: {item.companyCode}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium dark:text-gray-300">
                      {formatNumber(item.totalBookings)} vé
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div
                        className={`inline-flex items-center text-xs font-black px-2 py-1 rounded-lg ${
                          item.revenueGrowth >= 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        }`}
                      >
                        {item.revenueGrowth >= 0 ? "+" : ""}
                        {item.revenueGrowth}%
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-lg text-gray-900 dark:text-white">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-20 text-center text-gray-400 font-medium"
                  >
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    Không tìm thấy dữ liệu doanh thu khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer - Hiển thị tổng nhanh */}
            <tfoot className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr className="text-gray-900 dark:text-white font-black italic">
                <td className="px-6 py-4 tracking-tighter text-gray-400 uppercase text-xs">
                  TỔNG HỢP KỲ BÁO CÁO
                </td>
                <td className="px-6 py-4 text-right underline underline-offset-4">
                  {formatNumber(totalBookings)} VÉ
                </td>
                <td></td>
                <td className="px-6 py-4 text-right text-xl font-black text-purple-600 dark:text-purple-400 uppercase tracking-tighter">
                  {formatCurrency(totalRevenue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
