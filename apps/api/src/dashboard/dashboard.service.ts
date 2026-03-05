import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateDateRange,
  fillMissingChartDates,
  FINANCE_CONFIG,
} from '@obtp/business-logic';
import {
  FinanceReportQuery,
  FinancialReportResponse,
  PaymentTransactionSummary,
  TopCompanyStat,
} from '@obtp/shared-types';
import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly configService: ConfigService,
  ) {}

  async getAdminStats() {
    return this.dashboardRepository.getAdminQuickStats();
  }

  async getFinancialReport(
    query: FinanceReportQuery,
  ): Promise<FinancialReportResponse> {
    const baseFilter: any = {};
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    // 1. Xử lý khoảng thời gian lọc
    if (query.startDate && query.endDate) {
      startDate = dayjs(query.startDate).startOf('day').toDate();
      endDate = dayjs(query.endDate).endOf('day').toDate();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (query.period && String(query.period) !== 'all') {
      startDate = calculateDateRange(query.period);
      endDate = new Date();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // 2. Lọc theo nhà xe cụ thể nếu có
    if (query.companyId && Types.ObjectId.isValid(query.companyId)) {
      baseFilter.companyId = new Types.ObjectId(query.companyId);
    }

    // 3. Lấy dữ liệu tổng hợp từ Repository
    const [allTimeRevenue, data] = await Promise.all([
      this.dashboardRepository.getTotalRevenueAllTime(),
      this.dashboardRepository.getFinancialReportData(baseFilter),
    ]);

    // 4. Trích xuất các chỉ số tài chính
    const confirmed = data.statsByStatus.find((s) => s._id === 'CONFIRMED') || {
      amount: 0,
      count: 0,
    };
    const cancelled = data.statsByStatus.find((s) => s._id === 'CANCELLED') || {
      amount: 0,
      count: 0,
    };

    const commissionRate = this.configService.get<number>(
      'COMMISSION_RATE',
      FINANCE_CONFIG.PLATFORM_COMMISSION_RATE,
    );

    // 5. Chuẩn hóa dữ liệu Biểu đồ
    let finalChartData = data.revenueChart;
    if (startDate && endDate) {
      finalChartData = fillMissingChartDates(
        data.revenueChart,
        startDate,
        endDate,
      );
    }

    // 6. Định dạng Top Nhà xe
    const formattedTopCompanies: TopCompanyStat[] = data.topCompanies.map(
      (item) => ({
        name: item.name,
        revenue: item.revenue,
        bookings: item.bookings,
      }),
    );

    // 7. Lấy và định dạng danh sách giao dịch gần đây (SỬA LỖI TYPING TẠI ĐÂY)
    const recentDocs =
      await this.dashboardRepository.findRecentTransactions(baseFilter);

    const formattedTransactions: PaymentTransactionSummary[] =
      recentDocs.flatMap((doc: any): PaymentTransactionSummary[] => {
        const companyName = doc.companyId?.name || 'Unknown';
        const dateStr = doc.createdAt
          ? new Date(doc.createdAt).toISOString()
          : new Date().toISOString();

        const statusStr = String(doc.status || '').toUpperCase();
        const results: PaymentTransactionSummary[] = [];

        if (statusStr === 'CONFIRMED') {
          // Giao dịch booking khách trả
          results.push({
            id: doc._id.toString(),
            date: dateStr,
            companyName,
            description: `Vé #${doc.ticketCode || 'N/A'}`,
            type: 'booking', // TypeScript sẽ hiểu nhờ kết quả trả về của hàm được định nghĩa rõ ràng
            amount: Number(doc.totalAmount),
          });

          // Giao dịch trừ phí hoa hồng
          results.push({
            id: doc._id.toString() + '-comm',
            date: dateStr,
            companyName: 'Platform',
            description: 'Phí dịch vụ hệ thống',
            type: 'commission',
            amount: -(Number(doc.totalAmount) * commissionRate),
          });
        } else if (statusStr === 'CANCELLED') {
          // Giao dịch hoàn tiền
          results.push({
            id: doc._id.toString(),
            date: dateStr,
            companyName,
            description: `Hoàn vé #${doc.ticketCode || 'N/A'}`,
            type: 'refund',
            amount: -Number(doc.totalAmount),
          });
        }

        return results;
      });

    // 8. Trả về kết quả cuối cùng
    return {
      overview: {
        totalRevenue: allTimeRevenue,
        periodRevenue: confirmed.amount,
        totalBookings: confirmed.count,
        averageOrderValue: confirmed.count
          ? confirmed.amount / confirmed.count
          : 0,
        commission: confirmed.amount * commissionRate,
        refunds: cancelled.amount,
      },
      revenueChartData: finalChartData,
      topCompanies: formattedTopCompanies,
      recentTransactions: formattedTransactions,
    };
  }
  
}