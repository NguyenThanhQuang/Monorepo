import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  RefreshCw,
  Building2,
  Ticket,
  Search,
  FileText,
} from "lucide-react";
import { adminApi } from "@obtp/api-client";
import { formatCurrency, formatNumber } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRevenueStats } from "../hooks/useRevenueStats";

const getInitialDates = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    start: firstDay.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  };
};

export function AdminRevenuePage() {
  const { t } = useLanguage();
  const initDates = getInitialDates();

  const [dateRange, setDateRange] = useState({
    start: initDates.start,
    end: initDates.end,
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

  const totalRevenue = data.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0,
  );
  const totalBookings = data.reduce(
    (sum, item) => sum + (item.totalBookings || 0),
    0,
  );
  const companyList = data.map((item) => ({
    id: item.companyId,
    name: item.companyName,
  }));

  const handleExport = async (type: "excel" | "pdf") => {
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
      a.download = `Doanh_Thu_${dateRange.start}_${dateRange.end}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Lỗi xuất file");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl">
        Lỗi tải dữ liệu doanh thu.{" "}
        <button onClick={() => refetch()} className="underline font-bold">
          Thử lại
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
            Báo cáo doanh thu
          </h1>
          <p className="text-gray-500">Quản lý doanh thu theo nhà xe</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={isExporting || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-gray-500">Từ ngày</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((p) => ({ ...p, start: e.target.value }))
            }
            className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Đến ngày</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((p) => ({ ...p, end: e.target.value }))
            }
            className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Nhà xe</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700"
          >
            <option value="all">Tất cả</option>
            {companyList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500">Tìm kiếm</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tên, mã nhà xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-2 border rounded-xl dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Kpis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-500" />{" "}
            <span className="text-gray-500">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {formatCurrency(totalRevenue, true)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="text-blue-500" />{" "}
            <span className="text-gray-500">Tổng vé</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {formatNumber(totalBookings)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-green-500" />{" "}
            <span className="text-gray-500">Nhà xe hoạt động</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {filteredData.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-orange-500" />{" "}
            <span className="text-gray-500">Trung bình / Đơn</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {totalBookings > 0
              ? formatCurrency(totalRevenue / totalBookings)
              : "0đ"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-sm">
            <tr>
              <th className="p-4">Nhà xe</th>
              <th className="p-4">Số vé</th>
              <th className="p-4">Đánh giá</th>
              <th className="p-4">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.companyId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-4">
                    <div className="font-medium dark:text-white">
                      {item.companyName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.companyCode}
                    </div>
                  </td>
                  <td className="p-4 dark:text-white">
                    {formatNumber(item.totalBookings)}
                  </td>
                  <td className="p-4 text-yellow-500 font-medium">
                    ★ {item.averageRating.toFixed(1)}
                  </td>
                  <td className="p-4 font-bold text-green-600">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
