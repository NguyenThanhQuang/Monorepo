import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calculateDateRange, fillMissingChartDates, FINANCE_CONFIG } from '@obtp/business-logic';
import { FinanceReportQuery, FinancialReportResponse, PaymentTransactionSummary, TopCompanyStat } from '@obtp/shared-types';
import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { DashboardRepository } from './dashboard.repository';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly configService: ConfigService,
  ) {}

  async getAdminStats() {
    return this.dashboardRepository.getAdminQuickStats();
  }

  async getFinancialReport(query: FinanceReportQuery): Promise<FinancialReportResponse> {
    const baseFilter: any = {};
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate && query.endDate) {
      startDate = dayjs(query.startDate).startOf('day').toDate();
      endDate = dayjs(query.endDate).endOf('day').toDate();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (query.period && String(query.period) !== 'all') {
      startDate = calculateDateRange(query.period);
      endDate = new Date();
      baseFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (query.companyId && Types.ObjectId.isValid(query.companyId)) {
      baseFilter.companyId = new Types.ObjectId(query.companyId);
    }

    const reportData = await this.dashboardRepository.getFinancialReportData(baseFilter);
    const confirmed = reportData.statsByStatus[0];
    const commissionRate = this.configService.get<number>('COMMISSION_RATE', FINANCE_CONFIG.PLATFORM_COMMISSION_RATE);

    let finalChartData = reportData.revenueChart;
    if (startDate && endDate) {
      finalChartData = fillMissingChartDates(reportData.revenueChart, startDate, endDate);
    }

    const recentDocs = await this.dashboardRepository.findRecentTransactions(baseFilter);
    const formattedTransactions = recentDocs.flatMap((doc: any): PaymentTransactionSummary[] => {
      const companyName = doc.companyId?.name || 'Unknown';
      const dateStr = doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString();
      const statusStr = String(doc.status || '').toUpperCase();
      const res: PaymentTransactionSummary[] = [];

      if (statusStr === 'CONFIRMED' || statusStr === 'PAID') {
        res.push({ id: doc._id.toString(), date: dateStr, companyName, description: `Vé #${doc.ticketCode}`, type: 'booking', amount: Number(doc.totalAmount) });
        res.push({ id: doc._id.toString() + '-comm', date: dateStr, companyName: 'Platform', description: 'Phí hệ thống (10%)', type: 'commission', amount: -(Number(doc.totalAmount) * commissionRate) });
      }
      return res;
    });

    return {
      overview: {
        totalRevenue: await this.dashboardRepository.getTotalRevenueAllTime(),
        periodRevenue: confirmed.amount,
        totalBookings: confirmed.count,
        averageOrderValue: confirmed.count ? confirmed.amount / confirmed.count : 0,
        commission: confirmed.amount * commissionRate,
        refunds: 0,
      },
      revenueChartData: finalChartData,
      topCompanies: reportData.topCompanies,
      recentTransactions: formattedTransactions,
    };
  }

  async exportRevenueToExcel(query: FinanceReportQuery): Promise<Buffer> {
    const data = await this.getFinancialReport(query);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo doanh thu');

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Tên Nhà Xe', key: 'name', width: 35 },
      { header: 'Số Vé', key: 'bookings', width: 12 },
      { header: 'Doanh Thu Gộp', key: 'gross', width: 20 },
      { header: 'Hoa Hồng (10%)', key: 'comm', width: 20 },
      { header: 'Thực Nhận', key: 'net', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    
    data.topCompanies.forEach((item, index) => {
      worksheet.addRow({
        stt: index + 1,
        name: item.name,
        bookings: item.bookings,
        gross: item.revenue,
        comm: item.revenue * 0.1,
        net: item.revenue * 0.9,
      });
    });

    worksheet.getColumn('gross').numFmt = '#,##0"₫"';
    worksheet.getColumn('comm').numFmt = '#,##0"₫"';
    worksheet.getColumn('net').numFmt = '#,##0"₫"';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as any);
  }
}