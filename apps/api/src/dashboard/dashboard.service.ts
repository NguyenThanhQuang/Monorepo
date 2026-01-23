import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { Types } from 'mongoose';

// TYPES
import {
  BookingStatus,
  FinanceReportQuery,
  FinancialReportResponse,
} from '@obtp/shared-types';

// LOGIC LIB
import {
  calculateDateRange,
  fillMissingChartDates,
} from '@obtp/business-logic';

// REPO
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
    // 1. Calculate Date Range
    let startDate: Date;
    let endDate: Date = new Date();

    if (query.startDate && query.endDate) {
      startDate = dayjs(query.startDate).startOf('day').toDate();
      endDate = dayjs(query.endDate).endOf('day').toDate();
    } else {
      // Default period logic
      startDate = calculateDateRange(query.period || '30d');
    }

    // 2. Build Filter
    const baseFilter: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED] },
    };

    if (query.companyId && Types.ObjectId.isValid(query.companyId)) {
      baseFilter.companyId = new Types.ObjectId(query.companyId);
    }

    // 3. Execute Repo Queries
    const [allTimeRevenue, facetData] = await Promise.all([
      this.dashboardRepository.getTotalRevenueAllTime(),
      this.dashboardRepository.getFinancialReportData(baseFilter),
    ]);

    // 4. Process Aggregation Results
    const confirmedStats = facetData.statsByStatus.find(
      (s: any) => s._id === BookingStatus.CONFIRMED,
    );
    const cancelledStats = facetData.statsByStatus.find(
      (s: any) => s._id === BookingStatus.CANCELLED,
    );

    const periodRevenue = confirmedStats?.amount || 0;
    const periodBookings = confirmedStats?.count || 0;
    const periodRefunds = cancelledStats?.amount || 0;

    const commissionRate = this.configService.get<number>(
      'COMMISSION_RATE',
      0.15,
    ); // 15%

    // 5. Fill Missing Chart Data (Business Logic reuse)
    const filledChartData = fillMissingChartDates(
      facetData.revenueChart || [],
      startDate,
      endDate,
    );

    // 6. Recent Transactions Fetch & Format
    // Reuse baseFilter but remove specific status filter if want all types,
    // but usually report focuses on relevant ones.
    const recentDocs = await this.dashboardRepository.findRecentTransactions(
      baseFilter,
      20,
    );

    const formattedTransactions = recentDocs.flatMap((doc: any) => {
      const trans = [];
      const companyName = doc.companyId?.name || 'Unknown';
      const base = {
        id: doc._id.toString(),
        date: doc.createdAt.toISOString(),
        companyName,
        description: `Booking #${doc.ticketCode}`,
      };

      if (doc.status === BookingStatus.CONFIRMED) {
        trans.push({
          ...base,
          type: 'booking',
          amount: doc.totalAmount,
          status: 'completed',
        });
        // Simulate Commission Record
        trans.push({
          id: `${doc._id}-comm`,
          date: base.date,
          companyName: 'Platform',
          type: 'commission',
          description: `Commission Fee`,
          amount: -(doc.totalAmount * commissionRate),
          status: 'completed',
        });
      } else if (doc.status === BookingStatus.CANCELLED) {
        trans.push({
          ...base,
          type: 'refund',
          amount: -doc.totalAmount, // Refund is negative flow for revenue report? Or positive flow out?
          // Depends on UI perspective. Here we assume (-) is outflow from wallet.
          status: 'completed',
        });
      }
      return trans;
    });

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
      topCompanies: facetData.topCompanies || [],
      recentTransactions: formattedTransactions as any,
    };
  }
}
