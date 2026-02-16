import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BookingStatus } from '@obtp/shared-types';
import { ClientSession, Model, QueryFilter, Types } from 'mongoose';
import { BookingDefinition, BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectModel(BookingDefinition.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async create(
    doc: Partial<BookingDefinition>,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    const newBooking = new this.bookingModel(doc);
    return newBooking.save({ session });
  }
  async findByCompanyId(
    companyId: string | Types.ObjectId,
  ): Promise<BookingDocument[]> {
    const companyObjectId =
      typeof companyId === 'string' ? new Types.ObjectId(companyId) : companyId;

    return this.bookingModel
      .find({ companyId: companyObjectId })
      .populate({
        path: 'tripId',
        select: 'departureTime route vehicleId',
        populate: [
          { path: 'route.fromLocationId', select: 'name fullAddress' },
          { path: 'route.toLocationId', select: 'name fullAddress' },
          { path: 'vehicleId', select: 'licensePlate' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findById(id)
      .session(session || null)
      .exec();
  }

  async findOne(
    filter: QueryFilter<BookingDocument>,
  ): Promise<BookingDocument | null> {
    return this.bookingModel.findOne(filter).exec();
  }

  async save(
    booking: BookingDocument,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    return booking.save({ session });
  }

  /**
   * Dùng cho Lookup Vé: Populate sâu thông tin Trip -> Location
   */
  async findForLookup(
    filter: QueryFilter<BookingDocument>,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOne(filter)
      .populate({
        path: 'tripId',
        select: 'route departureTime vehicleId companyId',
        populate: [
          { path: 'companyId', select: 'name logoUrl' },
          { path: 'route.fromLocationId', select: 'name fullAddress province' },
          { path: 'route.toLocationId', select: 'name fullAddress province' },
        ],
      })
      .select('-paymentGatewayTransactionId -paymentOrderCode')
      .exec();
  }

  /**
   * Lịch sử đặt vé của User
   */
  async findByUserId(
    userId: string | Types.ObjectId,
  ): Promise<BookingDocument[]> {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    return this.bookingModel
      .find({ userId: userObjectId })
      .populate({
        path: 'tripId',
        select: 'departureTime route companyId status',
        populate: [
          { path: 'route.fromLocationId', select: 'name fullAddress' },
          { path: 'route.toLocationId', select: 'name fullAddress' },
          { path: 'companyId', select: 'name logoUrl' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Helper tìm theo code vé hoặc ID (cho endpoint lookup)
   */
  async findByCodeOrId(identifier: string): Promise<BookingDocument | null> {
    const isId = Types.ObjectId.isValid(identifier);
    const query: QueryFilter<BookingDocument> = isId
      ? {
          $or: [
            { _id: new Types.ObjectId(identifier) },
            { ticketCode: identifier },
          ],
        }
      : { ticketCode: identifier };

    return this.findForLookup(query);
  }

  async deleteById(id: string | Types.ObjectId): Promise<void> {
    await this.bookingModel.findByIdAndDelete(id).exec();
  }

  async getPopularRoutes(limit = 5): Promise<any[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return this.bookingModel.aggregate([
      {
        $match: {
          status: BookingStatus.CONFIRMED,
          createdAt: { $gte: ninetyDaysAgo },
        },
      },
      { $addFields: { tripObjectId: { $toObjectId: '$tripId' } } },
      {
        $lookup: {
          from: 'trips',
          localField: 'tripObjectId',
          foreignField: '_id',
          as: 'tripInfo',
        },
      },
      { $unwind: '$tripInfo' },
      {
        $addFields: {
          'tripInfo.route.fromLocationObjectId': {
            $toObjectId: '$tripInfo.route.fromLocationId',
          },
          'tripInfo.route.toLocationObjectId': {
            $toObjectId: '$tripInfo.route.toLocationId',
          },
        },
      },
      {
        $group: {
          _id: {
            from: '$tripInfo.route.fromLocationObjectId',
            to: '$tripInfo.route.toLocationObjectId',
          },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'locations',
          localField: '_id.from',
          foreignField: '_id',
          as: 'fromLocation',
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: '_id.to',
          foreignField: '_id',
          as: 'toLocation',
        },
      },
      { $unwind: '$fromLocation' },
      { $unwind: '$toLocation' },
      {
        $project: {
          _id: 0,
          fromLocation: '$fromLocation',
          toLocation: '$toLocation',
          bookingCount: 1,
        },
      },
    ]);
  }
}
