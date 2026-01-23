import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, QueryFilter, Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  // TRANSACTION SUPPORT: session là Optional
  async create(
    doc: Partial<Booking>,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    const newBooking = new this.bookingModel(doc);
    return newBooking.save({ session });
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

  // Update object và trả về bản mới
  async save(
    booking: BookingDocument,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    return booking.save({ session });
  }

  // --- QUERY FOR FEATURES ---

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
      .select('-paymentGatewayTransactionId -paymentOrderCode') // Ẩn info nhạy cảm
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
    // Check valid ObjectID first
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

  // Soft Delete wrapper (dùng nếu không muốn TTL xóa vật lý ngay)
  async deleteById(id: string | Types.ObjectId): Promise<void> {
    await this.bookingModel.findByIdAndDelete(id).exec();
  }
}
