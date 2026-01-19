import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Company,
  CompanyStatsResponse,
  UpdateCompanyPayload,
} from '@obtp/shared-types';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { CompanyDefinition, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(CompanyDefinition.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(
    // Payload lúc này đã tách AdminInfo, chỉ còn info của Company
    doc: Partial<Company>,
    session?: ClientSession,
  ): Promise<Company> {
    const newCompany = new this.companyModel(doc);
    return newCompany.save({ session });
  }

  async findOne(filter: FilterQuery<CompanyDocument>): Promise<Company | null> {
    return this.companyModel.findOne(filter).exec();
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyModel.findById(id).exec();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }

  async update(
    id: string,
    updateData: UpdateCompanyPayload,
    session?: ClientSession,
  ): Promise<Company | null> {
    return this.companyModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, session })
      .exec();
  }

  async delete(id: string): Promise<Company | null> {
    return this.companyModel.findByIdAndDelete(id).exec();
  }

  /**
   * Logic Aggregation phức tạp (Lookup Trips, Bookings, Reviews)
   * Note: Nếu collection Trips/Bookings chưa migrate xong, query này sẽ trả về array rỗng
   * nhưng không gây lỗi app.
   */
  async getCompanyStats(): Promise<CompanyStatsResponse[]> {
    const rawResult = await this.companyModel.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'companyId',
          as: 'trips',
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'companyId',
          pipeline: [{ $match: { status: 'confirmed' } }],
          as: 'bookings',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'companyId',
          as: 'reviews',
        },
      },
      {
        $project: {
          // Fields từ Company
          name: 1,
          code: 1,
          logoUrl: 1,
          email: 1,
          phone: 1,
          address: 1,
          status: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,

          // Fields tính toán
          totalTrips: { $size: '$trips' },
          totalRevenue: { $sum: '$bookings.totalAmount' },
          averageRating: { $avg: '$reviews.rating' },
        },
      },
    ]);

    // Mapping thủ công để khớp interface id string
    return rawResult.map((item) => ({
      ...item,
      id: item._id.toString(),
    }));
  }
}
