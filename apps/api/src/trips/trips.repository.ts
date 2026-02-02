import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TripStatus } from '@obtp/shared-types';
import {
  ClientSession,
  Model,
  QueryFilter,
  Types,
  UpdateQuery,
} from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';

@Injectable()
export class TripsRepository {
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
  ) {}

  // --- STANDARD CRUD ---

  async create(
    doc: Partial<Trip>,
    session?: ClientSession,
  ): Promise<TripDocument> {
    const newTrip = new this.tripModel(doc);
    return newTrip.save({ session });
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findById(id)
      .session(session || null)
      .exec();
  }

  async findOne(
    filter: QueryFilter<TripDocument>,
  ): Promise<TripDocument | null> {
    return this.tripModel.findOne(filter).exec();
  }

  async save(
    trip: TripDocument,
    session?: ClientSession,
  ): Promise<TripDocument> {
    return trip.save({ session });
  }

  async delete(id: string): Promise<TripDocument | null> {
    return this.tripModel.findByIdAndDelete(id).exec();
  }

  // --- ADVANCED QUERIES ---

  // Load đầy đủ thông tin để hiển thị chi tiết
  async findByIdWithDetails(
    id: string | Types.ObjectId,
  ): Promise<TripDocument | null> {
    return (
      this.tripModel
        .findById(id)
        .populate('companyId')
        // Populate nested object vehicle -> description, seatMap (nếu cần xem sơ đồ gốc)
        .populate('vehicleId', 'type vehicleNumber totalSeats')
        .populate('route.fromLocationId')
        .populate('route.toLocationId')
        .populate({ path: 'route.stops.locationId', model: 'Location' })
        .exec()
    );
  }

  // Dành cho Management List (Admin)
  async findManagementTrips(
    filter: QueryFilter<TripDocument>,
  ): Promise<TripDocument[]> {
    return this.tripModel
      .find(filter)
      .populate('companyId', 'name')
      .populate('vehicleId', 'type vehicleNumber')
      .populate('route.fromLocationId', 'name province')
      .populate('route.toLocationId', 'name province')
      .sort({ departureTime: -1 })
      .exec();
  }

  // Tìm Templates để Cronjob chạy (Generate Daily Trips)
  async findActiveRecurrenceTemplates(): Promise<TripDocument[]> {
    return this.tripModel
      .find({
        isRecurrenceTemplate: true,
        isRecurrenceActive: true,
      })
      .populate('companyId') // Để check status company active không
      .populate('vehicleId') // Để check status vehicle active không
      .exec();
  }

  /**
   * ADVANCED SEARCH: Tìm chuyến đi công khai (Public Search)
   * Sử dụng Aggregation để filter theo Province Name (String Match)
   */
  async findPublicTripsByCondition(
    startOfDay: Date,
    endOfDay: Date,
    fromKeyword: string,
    toKeyword: string,
  ): Promise<any[]> {
    const fromRegex = new RegExp(fromKeyword, 'i');
    const toRegex = new RegExp(toKeyword, 'i');

    return this.tripModel
      .aggregate([
        // 1. Filter cơ bản: Thời gian + Status
        {
          $match: {
            departureTime: { $gte: startOfDay, $lte: endOfDay },
            status: TripStatus.SCHEDULED,
            isRecurrenceTemplate: false, // Không hiện template
          },
        },
        // 2. Lookup & Match Location (Đây là phần nặng nhất, index giúp một phần ở step 1)
        {
          $lookup: {
            from: 'locations',
            localField: 'route.fromLocationId',
            foreignField: '_id',
            as: 'fromLoc',
          },
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'route.toLocationId',
            foreignField: '_id',
            as: 'toLoc',
          },
        },
        // Unwind để filter (lưu ý preserveNullAndEmptyArrays nếu data lỏng lẻo, nhưng Trip bắt buộc location nên OK)
        { $unwind: '$fromLoc' },
        { $unwind: '$toLoc' },
        {
          $match: {
            'fromLoc.province': { $regex: fromRegex },
            'toLoc.province': { $regex: toRegex },
          },
        },
        // 3. Lookup Company (Chỉ lấy xe của cty Active)
        {
          $lookup: {
            from: 'companies',
            localField: 'companyId',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        {
          $match: { 'company.status': 'active' },
        },
        // 4. Lookup Vehicle (Lấy thông tin loại xe)
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicle',
          },
        },
        { $unwind: '$vehicle' },
        // 5. Project Output gọn gàng
        {
          $project: {
            _id: 1,
            departureTime: 1,
            expectedArrivalTime: 1,
            price: 1,
            seats: 1, // Trả về ghế để client đếm số lượng available (hoặc logic đếm sẵn ở backend service)

            // Nested Info Flattening for Frontend Convenience
            'company._id': 1,
            'company.name': 1,
            'company.logoUrl': 1,
            'vehicle.type': 1,
            fromLocation: '$fromLoc',
            toLocation: '$toLoc',
          },
        },
      ])
      .exec();
  }

  // Helper tìm trip con trong ngày (dùng cho Cronjob check duplicate)
  async findDailyTrip(
    parentId: string | Types.ObjectId,
    date: Date,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findOne({
        recurrenceParentId: parentId,
        departureTime: date,
      })
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateQuery<TripDocument>,
    session?: ClientSession,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .exec();
  }

  /**
   * Kiểm tra xem xe có đang được sử dụng trong các chuyến đi Sắp/Đang chạy hay không
   * Dùng cho việc Validation bên Vehicles Module
   */
  async hasActiveTripsForVehicle(vehicleId: string): Promise<boolean> {
    const count = await this.tripModel
      .countDocuments({
        vehicleId: new Types.ObjectId(vehicleId),
        status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      })
      .exec();
    return count > 0;
  }
}
