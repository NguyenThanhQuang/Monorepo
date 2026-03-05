import { Injectable } from '@nestjs/common';
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

  async getAdminQuickStats(): Promise<AdminDashboardStats> {
    const[
      totalCompanies,
      totalUsers,
      totalBookingsRes,
      totalRevenueResult,
      activeTrips,
      newCompaniesToday,
      todayBookingsRes,
    ] = await Promise.all([
      this.companyModel.countDocuments(),
      this.userModel.countDocuments({ roles: UserRole.USER }),
      
      // FIX: Dùng $addFields tạo status ảo in HOA để vượt rào Mongoose
      this.bookingModel.aggregate([
        { $addFields: { normalizedStatus: { $toUpper: '$status' } } },
        { $match: { normalizedStatus: 'CONFIRMED' } },
        { $count: "count" }
      ]),
      
      this.bookingModel.aggregate([
        { $addFields: { normalizedStatus: { $toUpper: '$status' } } },
        { $match: { normalizedStatus: 'CONFIRMED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      this.tripModel.countDocuments({
        status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      }),
      this.companyModel.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: CompanyStatus.ACTIVE,
      }),
      
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $addFields: { normalizedStatus: { $toUpper: '$status' } } },
        { $match: { normalizedStatus: 'CONFIRMED' } },
        { $count: "count" }
      ]),
    ]);

    return {
      totalCompanies,
      totalUsers,
      totalBookings: totalBookingsRes[0]?.count || 0,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      activeTrips,
      newCompaniesToday,
      todayBookings: todayBookingsRes[0]?.count || 0,
    };
  }

async getTotalRevenueAllTime(): Promise<number> {
  const res = await this.bookingModel.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'CONFIRMED'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  console.log('Total revenue result:', res); // Thêm log để debug
  return res[0]?.total || 0;
}
 async getFinancialReportData(matchFilter: any) {
  const result = await this.bookingModel.aggregate([
    // 1. Lọc theo Date và Company (từ UI) nếu có
    { $match: matchFilter },

    // 2. Chuẩn hóa status và companyId
    { 
      $addFields: { 
        normalizedStatus: { $toUpper: '$status' },
        normalizedCompanyId: { 
          $cond: {
            if: { $ne: [{ $type: "$companyId" }, "missing"] },
            then: "$companyId",
            else: {
              $cond: {
                if: { $ne: [{ $type: "$companyID" }, "missing"] },
                then: "$companyID",
                else: null
              }
            }
          }
        }
      } 
    },

    // 3. Lọc theo status (CONFIRMED hoặc CANCELLED)
    { 
      $match: { 
        normalizedStatus: { $in: ["CONFIRMED", "CANCELLED"] }
      } 
    },

    // 4. Facet để gom dữ liệu
    {
      $facet: {
        statsByStatus: [
          {
            $group: {
              _id: '$normalizedStatus',
              amount: { $sum: '$totalAmount' },
              count: { $sum: 1 },
            },
          },
        ],
        revenueChart: [
          { $match: { normalizedStatus: 'CONFIRMED' } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              revenue: { $sum: '$totalAmount' },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              revenue: 1,
              bookings: 1,
            },
          },
        ],
        topCompanies: [
          { $match: { normalizedStatus: 'CONFIRMED' } },
          {
            $group: {
              _id: '$normalizedCompanyId',
              revenue: { $sum: '$totalAmount' },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $addFields: {
              companyObjId: {
                $cond: {
                  if: { $eq: [{ $type: '$_id' }, 'string'] },
                  then: { $toObjectId: '$_id' },
                  else: '$_id',
                },
              },
            },
          },
          {
            $lookup: {
              from: 'companies',
              localField: 'companyObjId',
              foreignField: '_id',
              as: 'info',
            },
          },
          { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              companyId: { $toString: '$_id' },
              companyCode: { $ifNull: ['$info.code', 'UNKNOWN'] },
              name: { $ifNull: ['$info.name', 'Nhà xe chưa xác định'] },
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

async findRecentTransactions(matchFilter: any, limit = 20): Promise<any[]> {
  // Tạo điều kiện tìm kiếm linh hoạt cho cả companyId và companyID
  const companyCondition = [];
  
  if (matchFilter.companyId) {
    companyCondition.push(
      { companyId: matchFilter.companyId },
      { companyID: matchFilter.companyId }
    );
  }
  
  const statusCondition = {
    $expr: { 
      $in: [
        { $toUpper: "$status" }, 
        ["CONFIRMED", "CANCELLED"]
      ] 
    }
  };
  
  let finalFilter: any = {};
  
  if (companyCondition.length > 0) {
    finalFilter = {
      $and: [
        { $or: companyCondition },
        statusCondition
      ]
    };
  } else {
    finalFilter = statusCondition;
  }
  
  // Thêm điều kiện ngày tháng nếu có
  if (matchFilter.createdAt) {
    finalFilter = {
      $and: [
        { createdAt: matchFilter.createdAt },
        finalFilter
      ]
    };
  }

  return this.bookingModel
    .find(finalFilter)
    .select('createdAt status totalAmount ticketCode companyId companyID')
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('companyId', 'name')
    .populate('companyID', 'name') // Populate cả hai field
    .lean()
    .exec();
}
}