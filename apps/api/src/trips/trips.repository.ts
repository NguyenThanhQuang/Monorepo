import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TripStatus, TripStopStatus } from '@obtp/shared-types';
import {
  ClientSession,
  Model,
  QueryFilter,
  Types,
  UpdateQuery,
} from 'mongoose';
import { TripDefinition, TripDocument } from './schemas/trip.schema';

@Injectable()
export class TripsRepository {
  constructor(
    @InjectModel(TripDefinition.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  async create(
    doc: Partial<TripDefinition>,
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

  async findByIdWithDetails(
    id: string | Types.ObjectId,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findById(id)
      .populate('companyId') // SẼ HOẠT ĐỘNG SAU KHI IMPORT CompaniesModule
      .populate('vehicleId', 'type vehicleNumber totalSeats')
      .populate('route.fromLocationId')
      .populate('route.toLocationId')
      .populate({ path: 'route.stops.locationId', model: 'Location' })
      .exec();
  }

  async findManagementTrips(
    filter: QueryFilter<TripDocument>,
  ): Promise<TripDocument[]> {
    // SỬA: Chỉ populate khi cần thiết, nếu không có dữ liệu thì không populate
    return this.tripModel
      .find(filter)
      .populate('companyId') // SẼ HOẠT ĐỘNG SAU KHI IMPORT CompaniesModule
      .populate('vehicleId', 'type vehicleNumber totalSeats')
      .populate('route.fromLocationId', 'name province')
      .populate('route.toLocationId', 'name province')
      .sort({ departureTime: -1 })
      .exec();
  }

  async findActiveRecurrenceTemplates(): Promise<TripDocument[]> {
    return this.tripModel
      .find({
        isRecurrenceTemplate: true,
        isRecurrenceActive: true,
      })
      .populate('companyId')
      .populate('vehicleId')
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
        {
          $match: {
            departureTime: { $gte: startOfDay, $lte: endOfDay },
            status: TripStatus.SCHEDULED,
            isRecurrenceTemplate: false,
          },
        },
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
        { $unwind: '$fromLoc' },
        { $unwind: '$toLoc' },
        {
          $match: {
            'fromLoc.province': { $regex: fromRegex },
            'toLoc.province': { $regex: toRegex },
          },
        },
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
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicle',
          },
        },
        { $unwind: '$vehicle' },
        {
          $project: {
            _id: 1,
            departureTime: 1,
            expectedArrivalTime: 1,
            price: 1,
            seats: 1,
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

  async search(filter: any) {
    return this.tripModel
      .find(filter)
      .populate('route.fromLocationId')
      .populate('route.toLocationId')
      .populate('companyId')
      .sort({ departureTime: 1 })
      .exec();
  }

  async searchByRoute(fromId: string, toId: string) {
    return this.tripModel
      .find({
        'route.fromLocationId': new Types.ObjectId(fromId),
        'route.toLocationId': new Types.ObjectId(toId),
        status: { $ne: TripStatus.ARRIVED },
        isRecurrenceTemplate: false,
      })
      .populate('companyId', 'name logoUrl')
      .populate('vehicleId', 'type vehicleNumber totalSeats')
      .populate('route.fromLocationId', 'name province')
      .populate('route.toLocationId', 'name province')
      .sort({ departureTime: 1 })
      .exec();
  }

  async searchByFrom(fromId: string) {
    return this.tripModel
      .find({
        'route.fromLocationId': new Types.ObjectId(fromId),
        status: { $ne: TripStatus.ARRIVED },
        isRecurrenceTemplate: false,
      })
      .populate('companyId', 'name logoUrl')
      .populate('vehicleId', 'type vehicleNumber totalSeats amenities')
      .populate('route.fromLocationId', 'name province')
      .populate('route.toLocationId', 'name province')
      .sort({ departureTime: 1 })
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

  async updateStopStatus(
    tripId: string,
    locationId: string,
    status: TripStopStatus,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(tripId),
          'route.stops.locationId': new Types.ObjectId(locationId),
        },
        {
          $set: { 'route.stops.$.status': status },
        },
        { new: true },
      )
      .exec();
  }

  async updateManyStatus(
    filter: QueryFilter<TripDocument>,
    newStatus: TripStatus,
  ): Promise<any> {
    return this.tripModel
      .updateMany(filter, {
        $set: { status: newStatus },
      })
      .exec();
  }
}
