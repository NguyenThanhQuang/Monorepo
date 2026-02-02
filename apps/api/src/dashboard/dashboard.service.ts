import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateDateRange,
  fillMissingChartDates,
} from '@obtp/business-logic';
import {
  BookingStatus,
  FinanceReportQuery,
  FinancialReportResponse,
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
    let startDate: Date;
    let endDate: Date = new Date();

    if (query.startDate && query.endDate) {
      startDate = dayjs(query.startDate).startOf('day').toDate();
      endDate = dayjs(query.endDate).endOf('day').toDate();
    } else {
      startDate = calculateDateRange(query.period || '30d');
    }

    const baseFilter: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED] },
    };

    if (query.companyId && Types.ObjectId.isValid(query.companyId)) {
      baseFilter.companyId = new Types.ObjectId(query.companyId);
    }

    const [allTimeRevenue, facetData] = await Promise.all([
      this.dashboardRepository.getTotalRevenueAllTime(),
      this.dashboardRepository.getFinancialReportData(baseFilter),
    ]);

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
    );

    const filledChartData = fillMissingChartDates(
      facetData.revenueChart || [],
      startDate,
      endDate,
    );

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
          amount: -doc.totalAmount,
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
