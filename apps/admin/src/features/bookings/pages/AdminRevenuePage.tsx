// src/features/admin/pages/AdminRevenuePage.tsx
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  Building2,
  Filter,
  Search,
  ChevronDown,
  FileText,
  Eye
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useAuth } from "../../../contexts/AuthContext";
import { adminApi, type CompanyRevenueStats, type RevenueFilterParams } from "@obtp/api-client";

export function AdminRevenuePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyRevenueStats[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyRevenueStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof CompanyRevenueStats>("totalRevenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [avgRevenue, setAvgRevenue] = useState(0);
  const [activeCompanies, setActiveCompanies] = useState(0);

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    filterAndSortCompanies();
  }, [companies, searchTerm, selectedCompany, sortBy, sortOrder]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      const params: RevenueFilterParams = {
        month: selectedMonth,
        year: selectedYear
      };

      const data = await adminApi.getRevenueStats(params);
      setCompanies(data);
      
      // Calculate statistics
      const totalRev = data.reduce((sum, company) => sum + company.totalRevenue, 0);
      const totalBook = data.reduce((sum, company) => sum + company.totalBookings, 0);
      const active = data.filter(c => c.totalRevenue > 0).length;
      
      setTotalRevenue(totalRev);
      setTotalBookings(totalBook);
      setAvgRevenue(active > 0 ? totalRev / active : 0);
      setActiveCompanies(active);
      
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCompanies = () => {
    let filtered = [...companies];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected company
    if (selectedCompany !== "all") {
      filtered = filtered.filter(company => company.companyId === selectedCompany);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy] ?? 0;
      const bValue = b[sortBy] ?? 0;
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredCompanies(filtered);
  };

  const handleSort = (field: keyof CompanyRevenueStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatCurrency = (amount: number, compact: boolean = false) => {
    if (compact) {
      if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)} tỷ`;
      }
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} tr`;
      }
      return amount.toLocaleString('vi-VN') + 'đ';
    }
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (date: Date, format: string = 'DD/MM/YYYY') => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    if (format === 'DD/MM/YYYY HH:mm') {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    return `${day}/${month}/${year}`;
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);

      const params: RevenueFilterParams = {
        month: selectedMonth,
        year: selectedYear
      };

      // Gọi API export
      const blob = await adminApi.exportRevenueReport(params);
      
      // Download file
      const fileName = `bao-cao-doanh-thu-${selectedMonth}-${selectedYear}.xlsx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error exporting report:', error);
      
      // Fallback: export từ dữ liệu hiện tại nếu API export chưa có
      try {
        // Prepare export data
        const exportData = filteredCompanies.map(company => ({
          'Nhà xe': company.companyName,
          'Mã số': company.companyCode,
          'Doanh thu': company.totalRevenue,
          'Số vé đã bán': company.totalBookings,
          'Số chuyến': company.totalTrips,
          'Đánh giá trung bình': company.averageRating.toFixed(1),
          'Tăng trưởng': `${company.revenueGrowth > 0 ? '+' : ''}${company.revenueGrowth.toFixed(1)}%`,
        }));

        // Summary data
        const summaryData = [
          { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': formatCurrency(totalRevenue) },
          { 'Chỉ số': 'Tổng số vé', 'Giá trị': totalBookings.toLocaleString('vi-VN') },
          { 'Chỉ số': 'Số nhà xe có doanh thu', 'Giá trị': activeCompanies },
          { 'Chỉ số': 'Doanh thu trung bình/nhà xe', 'Giá trị': formatCurrency(avgRevenue) },
          { 'Chỉ số': 'Tháng', 'Giá trị': `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` },
          { 'Chỉ số': 'Ngày xuất báo cáo', 'Giá trị': formatDate(new Date(), 'DD/MM/YYYY HH:mm') },
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng quan');

        // Add companies sheet
        const companiesWs = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, companiesWs, 'Chi tiết nhà xe');

        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Download file
        const fileName = `bao-cao-doanh-thu-${selectedMonth}-${selectedYear}.xlsx`;
        saveAs(data, fileName);
      } catch (fallbackError) {
        console.error('Fallback export error:', fallbackError);
        alert('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại sau.');
      }
    } finally {
      setExportLoading(false);
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↑';
    if (growth < 0) return '↓';
    return '→';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo doanh thu
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Tổng hợp doanh thu tất cả nhà xe
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Month Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none dark:text-white"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none dark:text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {exportLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng doanh thu */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 mb-4 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tổng doanh thu
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
        </div>

        {/* Tổng số vé */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 mb-4 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {totalBookings.toLocaleString('vi-VN')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tổng số vé đã bán
          </div>
        </div>

        {/* Nhà xe hoạt động */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 mb-4 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {activeCompanies}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Nhà xe có doanh thu
          </div>
          <div className="mt-2 text-xs text-gray-400">
            / {companies.length} tổng số
          </div>
        </div>

        {/* Doanh thu trung bình */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 mb-4 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(avgRevenue)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Doanh thu trung bình/nhà xe
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhà xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>

          {/* Company Filter */}
          <div className="w-full sm:w-64 flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none dark:text-white"
            >
              <option value="all">Tất cả nhà xe</option>
              {companies.map(company => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Info */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Sắp xếp: {sortBy === 'totalRevenue' ? 'Doanh thu' : 
                       sortBy === 'totalBookings' ? 'Số vé' : 
                       sortBy === 'revenueGrowth' ? 'Tăng trưởng' : 'Đánh giá'}
              {sortOrder === 'desc' ? ' ↓' : ' ↑'}
            </span>
          </div>
        </div>
      </div>

      {/* Companies Revenue Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chi tiết doanh thu nhà xe
          </h3>
        </div>

        {filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà xe
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    <div className="flex items-center gap-1">
                      Doanh thu
                      {sortBy === 'totalRevenue' && (
                        <ChevronDown className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('totalBookings')}
                  >
                    <div className="flex items-center gap-1">
                      Số vé
                      {sortBy === 'totalBookings' && (
                        <ChevronDown className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số chuyến
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('averageRating')}
                  >
                    <div className="flex items-center gap-1">
                      Đánh giá
                      {sortBy === 'averageRating' && (
                        <ChevronDown className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('revenueGrowth')}
                  >
                    <div className="flex items-center gap-1">
                      Tăng trưởng
                      {sortBy === 'revenueGrowth' && (
                        <ChevronDown className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCompanies.map((company) => (
                  <tr key={company.companyId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {company.logoUrl ? (
                          <img 
                            src={company.logoUrl} 
                            alt={company.companyName}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {company.companyName.charAt(0)}
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {company.companyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mã số: {company.companyCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(company.totalRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {company.totalBookings.toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {company.totalTrips}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {company.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getGrowthColor(company.revenueGrowth)}`}>
                        {getGrowthIcon(company.revenueGrowth)} {Math.abs(company.revenueGrowth).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          // Navigate to company detail
                          window.location.href = `/admin/companies/${company.companyId}`;
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không có dữ liệu doanh thu
            </h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Chưa có dữ liệu doanh thu trong tháng này
            </p>
          </div>
        )}
      </div>
    </div>
  );
}   