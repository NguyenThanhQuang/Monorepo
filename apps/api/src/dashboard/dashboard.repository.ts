import { BookingDefinition, BookingDocument } from '@/bookings/schemas/booking.schema';
import {
  CompanyDefinition,
  CompanyDocument,
} from '@/companies/schemas/company.schema';
import { Trip, TripDocument } from '@/trips/schemas/trip.schema';
import { UserDefinition, UserDocument } from '@/users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AdminDashboardStats,
  BookingStatus,
  CompanyStatus,
  TripStatus,
  UserRole,
} from '@obtp/shared-types';
import { Model } from 'mongoose';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(CompanyDefinition.name)
    private readonly companyModel: Model<CompanyDocument>,
    @InjectModel(UserDefinition.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(BookingDefinition.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
  ) {}

  // --- STATS OVERVIEW ---

  async getAdminQuickStats(): Promise<AdminDashboardStats> {
    // Parallel execution for performance
    const [
      totalCompanies,
      totalUsers,
      totalBookings,
      totalRevenueResult,
      activeTrips,
      newCompaniesToday,
      todayBookings,
    ] = await Promise.all([
      this.companyModel.countDocuments(),
      this.userModel.countDocuments({ roles: UserRole.USER }),
      this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED }),
      this.bookingModel.aggregate([
        { $match: { status: BookingStatus.CONFIRMED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.tripModel.countDocuments({
        status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      }),
      this.companyModel.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: CompanyStatus.ACTIVE,
      }),
      this.bookingModel.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: BookingStatus.CONFIRMED,
      }),
    ]);

    return {
      totalCompanies,
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      activeTrips,
      newCompaniesToday,
      todayBookings,
    };
  }

  async getTotalRevenueAllTime(): Promise<number> {
    const res = await this.bookingModel.aggregate([
      { $match: { status: BookingStatus.CONFIRMED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return res[0]?.total || 0;
  }

  // --- HEAVY REPORT AGGREGATION ---

  async getFinancialReportData(matchFilter: any) {
    const result = await this.bookingModel.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          // 1. Group by Status (Confirmed/Cancelled revenue)
          statsByStatus: [
            {
              $group: {
                _id: '$status',
                amount: { $sum: '$totalAmount' },
                count: { $sum: 1 },
              },
            },
          ],
          // 2. Revenue Chart by Date
          revenueChart: [
            { $match: { status: BookingStatus.CONFIRMED } },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                revenue: { $sum: '$totalAmount' },
                bookings: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } }, // Sort by Date ASC
            {
              $project: {
                _id: 0,
                date: '$_id',
                revenue: 1,
                bookings: 1,
              },
            },
          ],
          // 3. Top Companies
          topCompanies: [
            { $match: { status: BookingStatus.CONFIRMED } },
            {
              $group: {
                _id: '$companyId',
                revenue: { $sum: '$totalAmount' },
                bookings: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'companies',
                localField: '_id',
                foreignField: '_id',
                as: 'info',
              },
            },
            { $unwind: '$info' },
            {
              $project: {
                _id: 0,
                name: '$info.name',
                revenue: 1,
                bookings: 1,
              },
            },
          ],
        },
      },
    ]);

    return result[0];
  }

  // Lấy danh sách giao dịch gần nhất
  async findRecentTransactions(matchFilter: any, limit = 20): Promise<any[]> {
    // Reuse logic query + populate
    return this.bookingModel
      .find(matchFilter)
      .select('createdAt status totalAmount ticketCode companyId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('companyId', 'name')
      .lean()
      .exec();
  }
}
