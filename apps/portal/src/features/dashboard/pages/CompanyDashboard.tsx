import { FileText, TrendingUp, Calendar, Download, DollarSign } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { ReportPeriod, type Booking, BookingStatus, PaymentStatus } from "@obtp/shared-types";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { bookingsApi } from "@obtp/api-client";
import { formatCurrency, formatDate } from "../utils/formatters";

interface RevenueStats {
  totalRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageTicketPrice: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export function CompanyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
    revenueGrowth: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageTicketPrice: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>(ReportPeriod.MONTH);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const bookings = await bookingsApi.getCompanyBookings();

      console.log("Bookings data:", bookings);

      setRecentBookings(bookings.slice(0, 5));

      calculateRevenueStats(bookings);
      calculateMonthlyRevenue(bookings);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueStats = (bookings: Booking[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalRevenue = bookings
      .filter((b: Booking) => b.status === BookingStatus.CONFIRMED)
      .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

    const currentMonthRevenue = bookings
      .filter((b: Booking) => {
        const date = new Date(b.createdAt);
        return b.status === BookingStatus.CONFIRMED && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

    const previousMonthRevenue = bookings
      .filter((b: Booking) => {
        const date = new Date(b.createdAt);
        return b.status === BookingStatus.CONFIRMED && 
               date.getMonth() === previousMonth && 
               date.getFullYear() === previousMonthYear;
      })
      .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b: Booking) => b.status === BookingStatus.CONFIRMED).length;
    const cancelledBookings = bookings.filter((b: Booking) => b.status === BookingStatus.CANCELLED).length;
    const averageTicketPrice = completedBookings > 0 
      ? totalRevenue / completedBookings 
      : 0;

    setRevenueStats({
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      revenueGrowth,
      totalBookings,
      completedBookings,
      cancelledBookings,
      averageTicketPrice
    });
  };

  const calculateMonthlyRevenue = (bookings: Booking[]) => {
    const monthlyData: { [key: string]: MonthlyRevenue } = {};
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        month: key,
        revenue: 0,
        bookings: 0
      };
    }

    // Aggregate bookings data
    bookings.forEach((booking: Booking) => {
      const date = new Date(booking.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[key]) {
        if (booking.status === BookingStatus.CONFIRMED) {
          monthlyData[key].revenue += booking.totalAmount;
        }
        monthlyData[key].bookings += 1;
      }
    });

    setMonthlyRevenue(Object.values(monthlyData));
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      
      // Fetch all bookings for export
      const bookings = await bookingsApi.getCompanyBookings();

      // Prepare data for export
      const exportData = bookings.map((booking: Booking) => {
        // Helper function to safely get nested properties
        const getRouteName = () => {
          if (!booking.tripId || typeof booking.tripId !== 'object') return 'N/A';
          const trip = booking.tripId as any;
          if (!trip.route) return 'N/A';
          return `${trip.route?.fromLocationId?.name || ''} → ${trip.route?.toLocationId?.name || ''}`;
        };

        const getCompanyName = () => {
          if (!booking.tripId || typeof booking.tripId !== 'object') return 'N/A';
          const trip = booking.tripId as any;
          return trip.companyId?.name || 'N/A';
        };

        const getDepartureTime = () => {
          if (!booking.tripId || typeof booking.tripId !== 'object') return 'N/A';
          const trip = booking.tripId as any;
          return trip.departureTime ? formatDate(trip.departureTime) : 'N/A';
        };

        return {
          'Mã vé': booking.ticketCode || 'N/A',
          'Khách hàng': booking.contactName,
          'SĐT': booking.contactPhone,
          'Email': booking.contactEmail || 'N/A',
          'Số ghế': booking.passengers.map(p => p.seatNumber).join(', '),
          'Số lượng vé': booking.passengers.length,
          'Tổng tiền': booking.totalAmount,
          'Trạng thái': booking.status === BookingStatus.CONFIRMED ? 'Đã xác nhận' :
                        booking.status === BookingStatus.HELD ? 'Đang giữ' :
                        booking.status === BookingStatus.CANCELLED ? 'Đã hủy' : 'Chờ xử lý',
          'Thanh toán': booking.paymentStatus === PaymentStatus.PAID ? 'Đã thanh toán' :
                       booking.paymentStatus === PaymentStatus.PENDING ? 'Chờ thanh toán' : 
                       booking.paymentStatus === PaymentStatus.FAILED ? 'Thất bại' :
                       booking.paymentStatus === PaymentStatus.REFUNDED ? 'Đã hoàn tiền' : 'N/A',
          'Phương thức': booking.paymentMethod || 'N/A',
          'Ngày đặt': formatDate(booking.createdAt),
          'Ngày khởi hành': getDepartureTime(),
          'Tuyến đường': getRouteName(),
          'Nhà xe': getCompanyName()
        };
      });

      // Calculate summary statistics
      const totalRevenue = bookings
        .filter((b: Booking) => b.status === BookingStatus.CONFIRMED)
        .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);
      
      const confirmedBookings = bookings.filter((b: Booking) => b.status === BookingStatus.CONFIRMED).length;
      const cancelledBookings = bookings.filter((b: Booking) => b.status === BookingStatus.CANCELLED).length;
      const heldBookings = bookings.filter((b: Booking) => b.status === BookingStatus.HELD).length;

      const summaryData = [
        { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': formatCurrency(totalRevenue) },
        { 'Chỉ số': 'Tổng số vé đã bán', 'Giá trị': confirmedBookings },
        { 'Chỉ số': 'Số vé đã hủy', 'Giá trị': cancelledBookings },
        { 'Chỉ số': 'Số vé đang giữ', 'Giá trị': heldBookings },
        { 'Chỉ số': 'Giá vé trung bình', 'Giá trị': formatCurrency(confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0) },
        { 'Chỉ số': 'Ngày xuất báo cáo', 'Giá trị': formatDate(new Date(), 'DD/MM/YYYY HH:mm') },
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add summary sheet
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng quan');

      // Add bookings sheet
      const bookingsWs = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, bookingsWs, 'Chi tiết vé');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download file
      const fileName = `bao-cao-doanh-thu-${formatDate(new Date(), 'YYYY-MM-DD')}.xlsx`;
      saveAs(data, fileName);

    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại sau.');
    } finally {
      setExportLoading(false);
    }
  };

  const getRevenueGrowthColor = () => {
    if (revenueStats.revenueGrowth > 0) return 'text-green-600';
    if (revenueStats.revenueGrowth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRevenueGrowthIcon = () => {
    if (revenueStats.revenueGrowth > 0) return '↑';
    if (revenueStats.revenueGrowth < 0) return '↓';
    return '→';
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
            Dashboard Nhà Xe
          </h1>
          <p style={{ color: 'var(--obtp-muted2)', marginTop: 6 }}>
            Công ty: {user?.companyId || 'N/A'}
          </p>
        </div>

        <div className="flex gap-3">
          <select 
            className="obtp-input" style={{ width: 160, padding: '10px 12px' }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
          >
            <option value={ReportPeriod.MONTH}>Tháng này</option>
            <option value={ReportPeriod.QUARTER}>Quý này</option>
            <option value={ReportPeriod.YEAR}>Năm nay</option>
            <option value="all">Tất cả</option>
          </select>

          <button 
            onClick={handleExportReport}
            disabled={exportLoading}
            className="obtp-btn"
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Tổng doanh thu */}
            <div className="obtp-card obtp-card-strong rounded-3xl p-6  hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 mb-4 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(revenueStats.totalRevenue)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--obtp-muted2)' }}>
                Tổng doanh thu
              </div>
            </div>

            {/* Doanh thu tháng này */}
            <div className="obtp-card obtp-card-strong rounded-3xl p-6  hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 mb-4 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(revenueStats.currentMonthRevenue)}
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, color: 'var(--obtp-muted2)' }}>
                  Doanh thu tháng này
                </span>
                <span className={`text-sm font-medium ${getRevenueGrowthColor()}`}>
                  {getRevenueGrowthIcon()} {Math.abs(revenueStats.revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Tổng số vé */}
            <div className="obtp-card obtp-card-strong rounded-3xl p-6  hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 mb-4 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {revenueStats.totalBookings}
              </div>
              <div style={{ fontSize: 13, color: 'var(--obtp-muted2)' }}>
                Tổng số vé
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <span className="text-green-600">✓ {revenueStats.completedBookings} đã xác nhận</span>
                <span className="text-red-600">✗ {revenueStats.cancelledBookings} đã hủy</span>
              </div>
            </div>

            {/* Giá vé trung bình */}
            <div className="obtp-card obtp-card-strong rounded-3xl p-6  hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 mb-4 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(revenueStats.averageTicketPrice)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--obtp-muted2)' }}>
                Giá vé trung bình
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="obtp-card obtp-card-strong" style={{ padding: 16, marginTop: 4 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Doanh thu 6 tháng gần nhất
              </h3>
            </div>

            <div className="h-80">
              {monthlyRevenue.length > 0 && monthlyRevenue.some(m => m.revenue > 0) ? (
                <div className="relative h-full">
                  {/* Chart bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-4">
                    {monthlyRevenue.map((item, index) => {
                      const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
                      const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex flex-col items-center w-16">
                          <div className="relative w-full group">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-teal-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-teal-500"
                              style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                  {formatCurrency(item.revenue)} ({item.bookings} vé)
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 font-medium">
                            {item.month.split('-')[1]}/{item.month.split('-')[0].slice(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(item.revenue, true)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p style={{ color: 'var(--obtp-muted2)', marginTop: 6 }}>Chưa có dữ liệu doanh thu</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="obtp-card obtp-card-strong rounded-3xl ">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Đơn đặt gần đây
              </h3>
            </div>

            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số ghế</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentBookings.map((booking) => {
                      // Helper function để lấy thông tin tuyến đường an toàn
                      const getRouteDisplay = () => {
                        if (!booking.tripId || typeof booking.tripId !== 'object') return 'N/A';
                        const trip = booking.tripId as any;
                        if (!trip.route) return 'N/A';
                        const fromName = trip.route?.fromLocationId?.name || '';
                        const toName = trip.route?.toLocationId?.name || '';
                        return fromName && toName ? `${fromName} → ${toName}` : 'N/A';
                      };

                      return (
                        <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {booking.ticketCode || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{booking.contactName}</div>
                            <div className="text-xs text-gray-400">{booking.contactPhone}</div>
                            <div className="text-xs text-gray-400">{getRouteDisplay()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.passengers.map(p => p.seatNumber).join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(booking.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                              booking.status === BookingStatus.HELD ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status === BookingStatus.CONFIRMED ? 'Đã xác nhận' :
                               booking.status === BookingStatus.HELD ? 'Đang giữ' :
                               booking.status === BookingStatus.CANCELLED ? 'Đã hủy' : 'Chờ xử lý'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Chưa có đơn đặt nào
                </h4>
                <p className="text-gray-500 max-w-md mx-auto">
                  Các đơn đặt vé sẽ hiển thị tại đây khi có khách hàng đặt vé
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}