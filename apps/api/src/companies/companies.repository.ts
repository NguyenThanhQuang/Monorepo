import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Company,
  CompanyStatsResponse,
  UpdateCompanyPayload,
} from '@obtp/shared-types';
import { ClientSession, Model, FilterQuery } from 'mongoose';
import { CompanyDefinition, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(CompanyDefinition.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async create(
    doc: Partial<Company>,
    session?: ClientSession,
  ): Promise<Company> {
    const newCompany = new this.companyModel(doc);
    return (await newCompany.save({ session })) as unknown as Company;
  }

  async findOne(filter: FilterQuery<CompanyDocument>): Promise<Company | null> {
    return this.companyModel
      .findOne(filter)
      .exec() as unknown as Company | null;
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyModel.findById(id).exec() as unknown as Company | null;
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec() as unknown as Company[];
  }

  async update(
    id: string,
    updateData: UpdateCompanyPayload,
    session?: ClientSession,
  ): Promise<Company | null> {
    return this.companyModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, session })
      .exec() as unknown as Company | null;
  }

  async delete(id: string): Promise<Company | null> {
    return this.companyModel
      .findByIdAndDelete(id)
      .exec() as unknown as Company | null;
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
          totalTrips: { $size: '$trips' },
          totalRevenue: { $sum: '$bookings.totalAmount' },
          averageRating: { $avg: '$reviews.rating' },
        },
      },
    ]);

    return rawResult.map((item) => ({
      ...item,
      id: item._id.toString(),
    }));
  }
}
