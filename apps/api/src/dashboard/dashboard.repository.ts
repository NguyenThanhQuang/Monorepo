import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AdminDashboardStats,
  CompanyStatus,
  TripStatus,
  UserRole,
} from '@obtp/shared-types';
import { Model } from 'mongoose';
import {
  BookingDefinition,
  BookingDocument,
} from 'src/bookings/schemas/booking.schema';
import {
  CompanyDefinition,
  CompanyDocument,
} from 'src/companies/schemas/company.schema';
import { TripDefinition, TripDocument } from 'src/trips/schemas/trip.schema';
import { UserDefinition, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class DashboardRepository {
  private readonly logger = new Logger(DashboardRepository.name);

  constructor(
    @InjectModel(CompanyDefinition.name)
    private readonly companyModel: Model<CompanyDocument>,
    @InjectModel(UserDefinition.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(BookingDefinition.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(TripDefinition.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  /**
   * Lấy số liệu nhanh cho Dashboard Admin (Header Cards)
   */
  async getAdminQuickStats(): Promise<AdminDashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kéo toàn bộ booking confirmed về để tính toán chính xác tuyệt đối
    const allConfirmed = await this.bookingModel
      .find({
        status: { $regex: /^confirmed$/i },
      })
      .lean()
      .exec();

    let totalRevenue = 0;
    let todayBookings = 0;

    allConfirmed.forEach((b) => {
      totalRevenue += Number(b.totalAmount || 0);
      if (b.createdAt && new Date(b.createdAt) >= today) {
        todayBookings++;
      }
    });

    const [totalCompanies, totalUsers, activeTrips, newCompaniesToday] =
      await Promise.all([
        this.companyModel.countDocuments(),
        this.userModel.countDocuments({ roles: UserRole.USER }),
        this.tripModel.countDocuments({
          status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
        }),
        this.companyModel.countDocuments({
          createdAt: { $gte: today },
          status: CompanyStatus.ACTIVE,
        }),
      ]);

    return {
      totalCompanies,
      totalUsers,
      totalBookings: allConfirmed.length,
      totalRevenue,
      activeTrips,
      newCompaniesToday,
      todayBookings,
    };
  }

  /**
   * Tính tổng doanh thu mọi thời đại
   */
  async getTotalRevenueAllTime(): Promise<number> {
    const res = await this.bookingModel
      .find({
        status: { $regex: /^confirmed$/i },
      })
      .lean()
      .exec();
    return res.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  }

  /**
   * Hàm cốt lõi: Tính toán báo cáo tài chính, biểu đồ và top nhà xe
   */
  async getFinancialReportData(matchFilter: any) {
    // 1. Tạo từ điển Nhà xe để tra cứu Tên và Mã (Tránh dùng $lookup bị lỗi ID)
    const allCompanies = await this.companyModel.find().lean().exec();
    const companyMap = new Map<string, { name: string; code: string }>();

    allCompanies.forEach((c: any) => {
      const idStr = c._id.toString();
      companyMap.set(idStr, { name: c.name, code: c.code });
    });

    // 2. Tìm danh sách Bookings theo điều kiện lọc (Ngày tháng / Nhà xe)
    const bookings = await this.bookingModel.find(matchFilter).lean().exec();

    this.logger.log(
      `[FINANCE] Found ${bookings.length} bookings for filter: ${JSON.stringify(matchFilter)}`,
    );

    let confirmedAmount = 0;
    let confirmedCount = 0;
    let cancelledAmount = 0;
    let cancelledCount = 0;

    const chartMap = new Map<string, { revenue: number; bookings: number }>();
    const topCmpMap = new Map<
      string,
      { name: string; companyCode: string; revenue: number; bookings: number }
    >();

    // 3. Duyệt qua dữ liệu để phân loại và tích lũy
    bookings.forEach((b: any) => {
      // Chuẩn hóa Status và Tiền
      const status = String(b.status || '').toUpperCase();
      const amount = Number(b.totalAmount || 0);

      // Xử lý ID nhà xe linh hoạt
      const rawCmpId = b.companyId || b.companyID;
      const cmpIdStr = rawCmpId ? rawCmpId.toString() : 'unknown';

      if (status === 'CONFIRMED') {
        confirmedAmount += amount;
        confirmedCount++;

        // A. Xử lý dữ liệu Biểu đồ (Nhóm theo ngày)
        const dateObj = b.createdAt ? new Date(b.createdAt) : null;
        if (dateObj && !isNaN(dateObj.getTime())) {
          const dateStr = dateObj.toISOString().split('T')[0];
          const currentDay = chartMap.get(dateStr) || {
            revenue: 0,
            bookings: 0,
          };
          currentDay.revenue += amount;
          currentDay.bookings += 1;
          chartMap.set(dateStr, currentDay);
        }

        // B. Xử lý dữ liệu Top Nhà xe
        const cmpInfo = companyMap.get(cmpIdStr) || {
          name: 'Nhà xe #' + cmpIdStr.slice(-4),
          code: 'N/A',
        };
        const currentCmpStats = topCmpMap.get(cmpIdStr) || {
          name: cmpInfo.name,
          companyCode: cmpInfo.code,
          revenue: 0,
          bookings: 0,
        };
        currentCmpStats.revenue += amount;
        currentCmpStats.bookings += 1;
        topCmpMap.set(cmpIdStr, currentCmpStats);
      } else if (status === 'CANCELLED') {
        cancelledAmount += amount;
        cancelledCount++;
      }
    });

    // 4. Chuyển đổi Map thành Array và sắp xếp
    const revenueChart = Array.from(chartMap.entries())
      .map(([date, val]) => ({
        date,
        revenue: val.revenue,
        bookings: val.bookings,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topCompanies = Array.from(topCmpMap.entries())
      .map(([id, val]) => ({
        companyId: id,
        name: val.name,
        companyCode: val.companyCode,
        revenue: val.revenue,
        bookings: val.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      statsByStatus: [
        { _id: 'CONFIRMED', amount: confirmedAmount, count: confirmedCount },
        { _id: 'CANCELLED', amount: cancelledAmount, count: cancelledCount },
      ],
      revenueChart,
      topCompanies,
    };
  }

  /**
   * Lấy lịch sử giao dịch gần đây và map tên nhà xe thủ công
   */
  async findRecentTransactions(matchFilter: any, limit = 20): Promise<any[]> {
    // Lấy map công ty trước
    const allCompanies = await this.companyModel.find().lean().exec();
    const companyMap = new Map<string, string>();
    allCompanies.forEach((c: any) =>
      companyMap.set(c._id.toString(), c.name),
    );

    const docs = await this.bookingModel
      .find(matchFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return docs.map((d) => {
      const rawCmpId = d.companyId || (d as any).companyID;
      const cmpIdStr = rawCmpId ? rawCmpId.toString() : 'unknown';

      return {
        ...d,
        companyId: {
          name: companyMap.get(cmpIdStr) || 'Nhà xe không xác định',
        },
      };
    });
  }
}