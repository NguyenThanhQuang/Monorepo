import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateDateRange,
  fillMissingChartDates,
  FINANCE_CONSTANTS,
} from '@obtp/business-logic';
import {
  FinanceReportQuery,
  FinancialReportResponse,
  PaymentTransactionSummary,
  CompanyRevenueStats, // Import type mới
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

    if (query.startDate && query.endDate) {
      startDate = dayjs(query.startDate).startOf('day').toDate();
      endDate = dayjs(query.endDate).endOf('day').toDate();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    } 
    else if (query.period && (query.period as string) !== 'all') {
      startDate = calculateDateRange(query.period);
      endDate = new Date();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (query.companyId && Types.ObjectId.isValid(query.companyId)) {
      baseFilter.companyId = new Types.ObjectId(query.companyId);
    }

    const[allTimeRevenue, facetData] = await Promise.all([
      this.dashboardRepository.getTotalRevenueAllTime(),
      this.dashboardRepository.getFinancialReportData(baseFilter),
    ]);

    // ✅ FIX: Định nghĩa fallback object có đầy đủ thuộc tính
    const defaultStat = { _id: 'UNKNOWN', amount: 0, count: 0 };

    const confirmedStats =
      facetData?.statsByStatus?.find(
        (s) => s._id === 'CONFIRMED',
      ) || defaultStat;

    const cancelledStats =
      facetData?.statsByStatus?.find(
        (s) => s._id === 'CANCELLED',
      ) || defaultStat;

    const periodRevenue = confirmedStats.amount; // ✅ Hết lỗi TS
    const periodBookings = confirmedStats.count; // ✅ Hết lỗi TS
    const periodRefunds = cancelledStats.amount; // ✅ Hết lỗi TS

    const commissionRate = this.configService.get<number>(
      'COMMISSION_RATE',
      FINANCE_CONSTANTS.PLATFORM_COMMISSION_RATE,
    );

    let filledChartData: any[] =[];
    if (startDate && endDate) {
       filledChartData = fillMissingChartDates(
        facetData?.revenueChart ||[],
        startDate,
        endDate,
      );
    } else {
       filledChartData = facetData?.revenueChart ||[];
    }

    const recentDocs = await this.dashboardRepository.findRecentTransactions(
      baseFilter,
      20,
    );

    const formattedTransactions: PaymentTransactionSummary[] =
      recentDocs.flatMap((doc: any) => {
        const trans: PaymentTransactionSummary[] =[];
        const companyName = doc.companyId?.name || 'Unknown';
        const base = {
          id: doc._id.toString(),
          date: doc.createdAt.toISOString(),
          companyName,
          description: `Booking #${doc.ticketCode}`,
        };

        const normalizedStatus = String(doc.status).toUpperCase();

        if (normalizedStatus === 'CONFIRMED') {
          trans.push({
            ...base,
            type: 'booking',
            amount: doc.totalAmount,
          });
          trans.push({
            id: `${doc._id}-comm`,
            date: base.date,
            companyName: 'Platform',
            type: 'commission',
            description: `Commission Fee`,
            amount: -(doc.totalAmount * commissionRate),
          });
        } else if (normalizedStatus === 'CANCELLED') {
          trans.push({
            ...base,
            type: 'refund',
            amount: -doc.totalAmount,
          });
        }
        return trans;
      });

    // ✅ FIX: Map đúng kiểu dữ liệu CompanyRevenueStats[]
    const formattedTopCompanies: CompanyRevenueStats[] = (facetData?.topCompanies || []).map(
      (item) => ({
        companyId: item.companyId,
        companyName: item.name,
        companyCode: item.companyCode,
        totalRevenue: item.revenue,
        totalBookings: item.bookings,
        totalTrips: Math.round(item.bookings / 10) || 0, // Mock logic tạm
        averageRating: 4.5, // Mock logic tạm
        revenueGrowth: 0, 
        monthlyData: [], 
      }),
    );

    return {
      overview: {
        totalRevenue: allTimeRevenue,
        periodRevenue,
        totalBookings: periodBookings,
        averageOrderValue: periodBookings ? periodRevenue / periodBookings : 0,
        commission: periodRevenue * commissionRate,
        refunds: periodRefunds,
      },
      revenueChartData: filledChartData,
      topCompanies: formattedTopCompanies,
      recentTransactions: formattedTransactions,
    };
  }
}