import { useState, useMemo } from "react";
import { RefreshCw, FileText, History, Search, ChevronLeft, ChevronRight, Download, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRevenueStats } from "../hooks/useRevenueStats";
import { adminApi } from "@obtp/api-client";

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => ({
    revenue: data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
    bookings: data.reduce((sum, item) => sum + (item.totalBookings || 0), 0),
    companies: data.length
  }), [data]);

  // HÀM XUẤT EXCEL CHUẨN
  const handleExport = async () => {
    const exportToast = toast.loading("Đang khởi tạo file Excel...");
    try {
      setIsExporting(true);
      const blob = await adminApi.exportRevenueReport({
        fromDate: dateRange.start || undefined,
        toDate: dateRange.end || undefined,
      });

      // Tạo một URL tạm thời cho dữ liệu Blob
      const url = window.URL.createObjectURL(new Blob([blob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bao_Cao_Doanh_Thu_OBTP_${new Date().toLocaleDateString()}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Tải xuống báo cáo thành công", { id: exportToast });
    } catch (err) {
      console.error("Lỗi Xuất File:", err);
      toast.error("Máy chủ không hỗ trợ xuất file hoặc bạn không có quyền", { id: exportToast });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-[5px] border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">
            <DollarSign size={12} /> Tài chính hệ thống
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("revenueStatistics")}
          </h1>
          <p className="text-gray-500 font-medium max-w-xl">{t("revenueStatisticsDesc")}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setDateRange({ start: "", end: "" })} 
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95"
          >
            <History size={18} /> {t("allTimeRevenue")}
          </button>
          
          <button 
            onClick={() => refetch()} 
            className="p-3.5 text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:text-purple-600 rounded-2xl transition-all active:rotate-180 duration-500"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`} />
          </button>

          <button 
            onClick={handleExport} 
            disabled={isExporting || data.length === 0} 
            className="flex items-center gap-3 px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-black/10 disabled:opacity-30 font-black uppercase text-xs tracking-widest"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            {isExporting ? "Đang tạo..." : "Xuất Báo Cáo"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <RevenueStatsCards 
        totalRevenue={stats.revenue} 
        totalBookings={stats.bookings} 
        activeCompanies={stats.companies} 
      />

      {/* Filter & Table Area */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kỳ bắt đầu</label>
              <input type="date" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kỳ kết thúc</label>
              <input type="date" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-bold transition-all" />
            </div>
          </div>
          
          <div className="flex-1 space-y-3 w-full">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tìm kiếm đơn vị</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Tên hoặc mã nhà xe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-bold transition-all" />
            </div>
          </div>
        </div>

        {/* Table */}
        <RevenueTable 
          data={paginatedData} 
          onViewDetail={(item) => setSelectedCompany(item)} 
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
              Trang <span className="text-gray-900 dark:text-white">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-2xl disabled:opacity-20 hover:bg-purple-600 hover:text-white transition-all shadow-inner">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-2xl disabled:opacity-20 hover:bg-purple-600 hover:text-white transition-all shadow-inner">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      <CompanyRevenueDetailModal 
        isOpen={!!selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
        data={selectedCompany} 
      />
    </div>
  );
}