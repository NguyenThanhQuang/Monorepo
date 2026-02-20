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
    const tripData = { ...doc };

    if (tripData.companyId && typeof tripData.companyId === 'string') {
      tripData.companyId = new Types.ObjectId(tripData.companyId);
    }

    if (tripData.vehicleId && typeof tripData.vehicleId === 'string') {
      tripData.vehicleId = new Types.ObjectId(tripData.vehicleId);
    }

    if (tripData.route) {
      if (
        tripData.route.fromLocationId &&
        typeof tripData.route.fromLocationId === 'string'
      ) {
        tripData.route.fromLocationId = new Types.ObjectId(
          tripData.route.fromLocationId,
        );
      }

      if (
        tripData.route.toLocationId &&
        typeof tripData.route.toLocationId === 'string'
      ) {
        tripData.route.toLocationId = new Types.ObjectId(
          tripData.route.toLocationId,
        );
      }

      if (tripData.route.stops && Array.isArray(tripData.route.stops)) {
        tripData.route.stops = tripData.route.stops.map((stop) => {
          const stopData = { ...stop }; // Tạo bản sao cho từng stop item
          if (stopData.locationId && typeof stopData.locationId === 'string') {
            stopData.locationId = new Types.ObjectId(stopData.locationId);
          }
          return stopData;
        });
      }
    }

    if (tripData.seats && Array.isArray(tripData.seats)) {
      tripData.seats = tripData.seats.map((seat) => {
        const seatData = { ...seat };
        if (seatData.bookingId && typeof seatData.bookingId === 'string') {
          seatData.bookingId = new Types.ObjectId(seatData.bookingId);
        }
        return seatData;
      });
    }

    if (
      tripData.recurrenceParentId &&
      typeof tripData.recurrenceParentId === 'string'
    ) {
      tripData.recurrenceParentId = new Types.ObjectId(
        tripData.recurrenceParentId,
      );
    }

    const newTrip = new this.tripModel(tripData);
    return newTrip.save({ session });
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findById(typeof id === 'string' ? new Types.ObjectId(id) : id)
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
    return this.tripModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
  }

  async findByIdWithDetails(
    id: string | Types.ObjectId,
  ): Promise<TripDocument | null> {
    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;

    return this.tripModel
      .findById(objectId)
      .populate({
        path: 'companyId',
        model: 'Company', // Sử dụng tên model chính xác
        select: '_id name email phone logoUrl status',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle', // Sử dụng tên model chính xác
        select:
          '_id vehicleNumber type totalSeats status floors seatRows seatColumns aislePositions',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location', // Sử dụng tên model chính xác
        select: '_id name province district address location',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location', // Sử dụng tên model chính xác
        select: '_id name province district address location',
      })
      .populate({
        path: 'route.stops.locationId',
        model: 'Location', // Sử dụng tên model chính xác
        select: '_id name province district address location',
      })
      .lean()
      .exec();
  }

  async findManagementTrips(
    filter: QueryFilter<TripDocument>,
  ): Promise<TripDocument[]> {
    // Log filter để debug
    console.log(
      'Finding management trips with filter:',
      JSON.stringify(filter),
    );

    return this.tripModel
      .find(filter)
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name email phone logoUrl',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: '_id vehicleNumber type totalSeats',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .sort({ departureTime: -1 })
      .lean()
      .exec();
  }

  async findActiveRecurrenceTemplates(): Promise<TripDocument[]> {
    return this.tripModel
      .find({
        isRecurrenceTemplate: true,
        isRecurrenceActive: true,
      })
      .populate({
        path: 'companyId',
        model: 'Company',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
      })
      .lean()
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
    const objectId =
      typeof parentId === 'string' ? new Types.ObjectId(parentId) : parentId;

    return this.tripModel
      .findOne({
        recurrenceParentId: objectId,
        departureTime: date,
      })
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateQuery<TripDocument>,
    session?: ClientSession,
  ): Promise<TripDocument | null> {
    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;

    return this.tripModel
      .findByIdAndUpdate(objectId, updateData, { new: true, session })
      .lean()
      .exec();
  }

  async searchTripsByLocationId(
    fromLocationId: string,
    toLocationId: string,
    date: string,
  ) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    return this.tripModel
      .find({
        'route.fromLocationId': new Types.ObjectId(fromLocationId),
        'route.toLocationId': new Types.ObjectId(toLocationId),
        departureTime: {
          $gte: start,
          $lt: end,
        },
        status: 'scheduled',
      })
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name logoUrl',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: '_id vehicleNumber type totalSeats amenities',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province district address',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province district address',
      })
      .lean();
  }

  async search(filter: any) {
    return this.tripModel
      .find(filter)
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
      })
      .populate({
        path: 'companyId',
        model: 'Company',
      })
      .sort({ departureTime: 1 })
      .lean()
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
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name logoUrl',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: '_id vehicleNumber type totalSeats',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .sort({ departureTime: 1 })
      .lean()
      .exec();
  }

  async searchByFrom(fromId: string) {
    return this.tripModel
      .find({
        'route.fromLocationId': new Types.ObjectId(fromId),
        status: { $ne: TripStatus.ARRIVED },
        isRecurrenceTemplate: false,
      })
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name logoUrl',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: '_id vehicleNumber type totalSeats amenities',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province',
      })
      .sort({ departureTime: 1 })
      .lean()
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
      .lean()
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
