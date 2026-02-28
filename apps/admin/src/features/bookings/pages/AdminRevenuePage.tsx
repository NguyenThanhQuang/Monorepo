// src/features/admin/pages/AdminRevenuePage.tsx
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Download,
  DollarSign,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Building2,
  Ticket,
  Search,
  FileText,
  Printer
} from "lucide-react";
import { adminApi, type CompanyRevenueStats, type RevenueFilterParams } from "@obtp/api-client";
import { format } from "date-fns";
import { useLanguage } from "../../../contexts/LanguageContext";

export function AdminRevenuePage() {
  const { t } = useLanguage();
  const [data, setData] = useState<CompanyRevenueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [filteredData, setFilteredData] = useState<CompanyRevenueStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyList, setCompanyList] = useState<{ id: string; name: string }[]>([]);

  // Fetch dữ liệu khi thay đổi bộ lọc ngày hoặc retry
  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate, retryCount]);

  // Lọc dữ liệu theo công ty và từ khóa tìm kiếm
  useEffect(() => {
    let filtered = [...data];

    if (selectedCompany !== "all") {
      filtered = filtered.filter(item => item.companyId === selectedCompany);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.companyName.toLowerCase().includes(term) ||
          item.companyCode.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
  }, [data, selectedCompany, searchTerm]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: RevenueFilterParams = {
        fromDate: startDate,
        toDate: endDate
      };

      const revenueData = await adminApi.getRevenueStats(params);
      console.log('Revenue data received:', revenueData); // Debug log

      // Kiểm tra nếu revenueData là mảng và có dữ liệu
      if (Array.isArray(revenueData) && revenueData.length > 0) {
        setData(revenueData);

        // Cập nhật danh sách công ty cho dropdown
        const companies = revenueData.map(item => ({
          id: item.companyId,
          name: item.companyName
        }));
        setCompanyList(companies);

        // Tính tổng doanh thu và số booking
        const revenue = revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const bookings = revenueData.reduce((sum, item) => sum + (item.totalBookings || 0), 0);
        setTotalRevenue(revenue);
        setTotalBookings(bookings);
      } else {
        // Nếu không có dữ liệu, set mảng rỗng
        setData([]);
        setCompanyList([]);
        setTotalRevenue(0);
        setTotalBookings(0);
        
        // Chỉ hiển thị thông báo lỗi nếu thực sự không có dữ liệu
        if (revenueData && Array.isArray(revenueData) && revenueData.length === 0) {
          setError(t('noDataAvailable') || 'Không có dữ liệu doanh thu trong khoảng thời gian này');
        }
      }
    } catch (err: any) {
      console.error("Error fetching revenue data:", err);
      
      // Xử lý các loại lỗi cụ thể
      if (err?.response?.status === 404) {
        setError(t('apiNotImplemented') || 'API doanh thu chưa được triển khai');
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError(t('noPermission') || 'Bạn không có quyền xem dữ liệu này');
      } else if (err?.response?.status === 500) {
        setError(t('serverError') || 'Lỗi máy chủ, vui lòng thử lại sau');
      } else if (err?.message?.includes('Network Error')) {
        setError(t('networkError') || 'Không thể kết nối đến máy chủ');
      } else {
        setError(err?.message || t('unknownError') || 'Không thể tải dữ liệu doanh thu');
      }

      // Reset data khi có lỗi
      setData([]);
      setCompanyList([]);
      setTotalRevenue(0);
      setTotalBookings(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleExportReport = async (type: 'excel' | 'pdf' = 'excel') => {
    try {
      setLoading(true);
      const params: RevenueFilterParams = {
        fromDate: startDate,
        toDate: endDate,
        companyId: selectedCompany !== "all" ? selectedCompany : undefined
      };
      const blob = await adminApi.exportRevenueReport(params);
      
      // Kiểm tra nếu blob là dữ liệu hợp lệ
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-doanh-thu-${startDate}-den-${endDate}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('File rỗng');
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert(t('exportError') || 'Không thể xuất báo cáo, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0₫';
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu`;
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
  };

  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">{t('loadingRevenueData') || 'Đang tải dữ liệu...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('revenueStatistics') || 'Báo cáo doanh thu'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('revenueStatisticsDesc') || 'Quản lý doanh thu theo nhà xe và thời gian'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title={t('refresh') || 'Làm mới'}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            {t('exportExcel') || 'Xuất Excel'}
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t('exportPDF') || 'Xuất PDF'}
          </button>
          <button
            onClick={handlePrintReport}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            {t('print') || 'In báo cáo'}
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('fromDate') || 'Từ ngày'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('toDate') || 'Đến ngày'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('company') || 'Nhà xe'}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">{t('allCompanies') || 'Tất cả nhà xe'}</option>
              {companyList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('search') || 'Tìm kiếm'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchCompany') || 'Tìm theo tên nhà xe...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Lọc nhanh */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-500">{t('quickFilter') || 'Lọc nhanh:'}</span>
          <button
            onClick={() => setDateRange(7)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            7 {t('days') || 'ngày'}
          </button>
          <button
            onClick={() => setDateRange(30)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            30 {t('days') || 'ngày'}
          </button>
          <button
            onClick={() => {
              const date = new Date();
              setStartDate(format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd'));
              setEndDate(format(date, 'yyyy-MM-dd'));
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('thisMonth') || 'Tháng này'}
          </button>
          <button
            onClick={() => {
              const date = new Date();
              setStartDate(format(new Date(date.getFullYear(), 0, 1), 'yyyy-MM-dd'));
              setEndDate(format(date, 'yyyy-MM-dd'));
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('thisYear') || 'Năm nay'}
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('error') || 'Lỗi'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('retry') || 'Thử lại'}
          </button>
        </div>
      )}

      {/* Cards tổng quan (chỉ hiển thị nếu có dữ liệu) */}
      {!error && data.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue') || 'Tổng doanh thu'}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCompactCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDateRange()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalBookings') || 'Tổng số vé'}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBookings.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDateRange()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('companies') || 'Nhà xe'}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</p>
              <p className="text-xs text-gray-400 mt-2">{t('activeCompanies') || 'Có doanh thu'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('averageOrderValue') || 'Giá trị TB/đơn'}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookings > 0 ? formatCompactCurrency(Math.round(totalRevenue / totalBookings)) : '0đ'}
              </p>
              <p className="text-xs text-gray-400 mt-2">{t('estimatedValue') || 'Giá trị ước tính'}</p>
            </div>
          </div>

          {/* Bảng doanh thu */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCompany === "all"
                  ? (t('revenueByCompany') || 'Doanh thu theo nhà xe')
                  : (t('revenueDetails') || 'Chi tiết doanh thu')}
              </h3>
              <span className="text-sm text-gray-500">
                {t('showing') || 'Hiển thị'} {filteredData.length} {t('of') || 'trên'} {data.length}{' '}
                {t('companies') || 'nhà xe'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('company') || 'Nhà xe'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('code') || 'Mã số'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('bookings') || 'Số vé'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('trips') || 'Số chuyến'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('rating') || 'Đánh giá'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('growth') || 'Tăng trưởng'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('revenue') || 'Doanh thu'}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('actions') || 'Thao tác'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        {t('noRevenueData') || 'Không có dữ liệu doanh thu'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map(item => (
                      <tr key={item.companyId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.companyName}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={e => ((e.target as HTMLImageElement).src = 'https://via.placeholder.com/32')}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                  {item.companyCode?.substring(0, 2) || '?'}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{item.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-mono">
                          {item.companyCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                          {(item.totalBookings || 0).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                          {(item.totalTrips || 0).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {(item.averageRating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              (item.revenueGrowth || 0) > 0
                                ? 'text-green-600'
                                : (item.revenueGrowth || 0) < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {(item.revenueGrowth || 0) > 0 ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (item.revenueGrowth || 0) < 0 ? (
                              <ArrowDown className="w-4 h-4" />
                            ) : null}
                            <span className="font-medium">{Math.abs(item.revenueGrowth || 0).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(item.totalRevenue || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedCompany(item.companyId)}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                          >
                            {t('viewDetails') || 'Xem chi tiết'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredData.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={2} className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {t('total') || 'Tổng cộng'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {totalBookings.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {filteredData.reduce((sum, item) => sum + (item.totalTrips || 0), 0).toLocaleString('vi-VN')}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-right text-gray-500">
                        {t('average') || 'Trung bình'}:{' '}
                        {(filteredData.reduce((sum, item) => sum + (item.averageRating || 0), 0) / filteredData.length).toFixed(
                          1
                        )}
                        ★
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Hiển thị thông báo khi không có dữ liệu */}
      {!error && data.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl text-center">
          <div className="text-yellow-600 dark:text-yellow-400 text-5xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('noData') || 'Không có dữ liệu'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('noDataMessage') || 'Không có dữ liệu doanh thu trong khoảng thời gian này. Vui lòng thử lại với khoảng thời gian khác.'}
          </p>
          <button
            onClick={() => {
              setStartDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
              setEndDate(format(new Date(), 'yyyy-MM-dd'));
              handleRetry();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('resetAndRetry') || 'Đặt lại và thử lại'}
          </button>
        </div>
      )}
    </div>
  );
}