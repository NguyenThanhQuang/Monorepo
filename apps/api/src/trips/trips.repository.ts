import { BadRequestException, Injectable } from '@nestjs/common';
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

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Ho_Chi_Minh';

const isValidObjectId = (id: any) => Types.ObjectId.isValid(String(id || ''));
const toObjectId = (id: string) => new Types.ObjectId(String(id));

@Injectable()
export class TripsRepository {
  constructor(
    @InjectModel(TripDefinition.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  private ensureObjectId(id: string, fieldName: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        `${fieldName} must be a valid Mongo ObjectId (24-hex). Received: ${id}`,
      );
    }
    return toObjectId(id);
  }

  private ensureDateYYYYMMDD(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
      throw new BadRequestException(
        `date must be YYYY-MM-DD. Received: ${date}`,
      );
    }
    return String(date);
  }

  // ─────────────────────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────────────────────
  async create(
    doc: Partial<TripDefinition>,
    session?: ClientSession,
  ): Promise<TripDocument> {
    const tripData: any = { ...doc };

    // companyId
    if (tripData.companyId && typeof tripData.companyId === 'string') {
      if (!isValidObjectId(tripData.companyId)) {
        throw new BadRequestException(
          `Invalid companyId: ${tripData.companyId}`,
        );
      }
      tripData.companyId = toObjectId(tripData.companyId);
    }

    // vehicleId
    if (tripData.vehicleId && typeof tripData.vehicleId === 'string') {
      if (!isValidObjectId(tripData.vehicleId)) {
        throw new BadRequestException(
          `Invalid vehicleId: ${tripData.vehicleId}`,
        );
      }
      tripData.vehicleId = toObjectId(tripData.vehicleId);
    }

    // route ids
    if (tripData.route) {
      if (
        tripData.route.fromLocationId &&
        typeof tripData.route.fromLocationId === 'string'
      ) {
        if (!isValidObjectId(tripData.route.fromLocationId)) {
          throw new BadRequestException(
            `Invalid route.fromLocationId: ${tripData.route.fromLocationId}`,
          );
        }
        tripData.route.fromLocationId = toObjectId(
          tripData.route.fromLocationId,
        );
      }

      if (
        tripData.route.toLocationId &&
        typeof tripData.route.toLocationId === 'string'
      ) {
        if (!isValidObjectId(tripData.route.toLocationId)) {
          throw new BadRequestException(
            `Invalid route.toLocationId: ${tripData.route.toLocationId}`,
          );
        }
        tripData.route.toLocationId = toObjectId(tripData.route.toLocationId);
      }

      if (Array.isArray(tripData.route.stops)) {
        tripData.route.stops = tripData.route.stops.map((stop: any) => {
          const stopData = { ...stop };
          if (stopData.locationId && typeof stopData.locationId === 'string') {
            if (!isValidObjectId(stopData.locationId)) {
              throw new BadRequestException(
                `Invalid stop.locationId: ${stopData.locationId}`,
              );
            }
            stopData.locationId = toObjectId(stopData.locationId);
          }
          return stopData;
        });
      }
    }

    // seats.bookingId
    if (Array.isArray(tripData.seats)) {
      tripData.seats = tripData.seats.map((seat: any) => {
        const seatData = { ...seat };
        if (seatData.bookingId && typeof seatData.bookingId === 'string') {
          if (!isValidObjectId(seatData.bookingId)) {
            throw new BadRequestException(
              `Invalid seat.bookingId: ${seatData.bookingId}`,
            );
          }
          seatData.bookingId = toObjectId(seatData.bookingId);
        }
        return seatData;
      });
    }

    // recurrenceParentId
    if (
      tripData.recurrenceParentId &&
      typeof tripData.recurrenceParentId === 'string'
    ) {
      if (!isValidObjectId(tripData.recurrenceParentId)) {
        throw new BadRequestException(
          `Invalid recurrenceParentId: ${tripData.recurrenceParentId}`,
        );
      }
      tripData.recurrenceParentId = toObjectId(tripData.recurrenceParentId);
    }

    const newTrip = new this.tripModel(tripData);
    return newTrip.save({ session });
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<TripDocument | null> {
    const objectId =
      typeof id === 'string' ? this.ensureObjectId(id, 'id') : id;
    return this.tripModel
      .findById(objectId)
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
    const objectId = this.ensureObjectId(id, 'id');
    return this.tripModel.findByIdAndDelete(objectId).exec();
  }

  // ─────────────────────────────────────────────────────────────
  // Populate details
  // ─────────────────────────────────────────────────────────────
  async findByIdWithDetails(id: string | Types.ObjectId): Promise<any | null> {
    const objectId =
      typeof id === 'string' ? this.ensureObjectId(id, 'id') : id;

    return this.tripModel
      .findById(objectId)
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name email phone logoUrl status',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select:
          '_id vehicleNumber type totalSeats status floors seatRows seatColumns aislePositions amenities',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province district address location',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province district address location',
      })
      .populate({
        path: 'route.stops.locationId',
        model: 'Location',
        select: '_id name province district address location',
      })
      .lean()
      .exec();
  }

  async findManagementTrips(filter: QueryFilter<TripDocument>): Promise<any[]> {
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
      .populate({
        path: 'driverId',
        model: 'UserDefinition',
        select: '_id name phone',
      })
      .sort({ departureTime: -1 })
      .lean()
      .exec();
  }

  async findActiveRecurrenceTemplates(): Promise<any[]> {
    return this.tripModel
      .find({ isRecurrenceTemplate: true, isRecurrenceActive: true })
      .populate({ path: 'companyId', model: 'Company' })
      .populate({ path: 'vehicleId', model: 'Vehicle' })
      .lean()
      .exec();
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC SEARCH by province keyword (aggregation)
  // ─────────────────────────────────────────────────────────────
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
            departureTime: { $gte: startOfDay, $lt: endOfDay },
            status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
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
        { $match: { 'company.status': 'active' } },
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
            status: 1,
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
      typeof parentId === 'string'
        ? this.ensureObjectId(parentId, 'parentId')
        : parentId;

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
  ): Promise<any | null> {
    const objectId =
      typeof id === 'string' ? this.ensureObjectId(id, 'id') : id;

    return this.tripModel
      .findByIdAndUpdate(objectId, updateData, {
        returnDocument: 'after',
        session,
      })
      .lean()
      .exec();
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ MAIN SEARCH: by from/to LocationId + date (YYYY-MM-DD)
  // ─────────────────────────────────────────────────────────────
  async searchTripsByLocationId(
    fromLocationId: string,
    toLocationId: string,
    date: string,
    options?: { includeDeparted?: boolean },
  ) {
    const dateStr = this.ensureDateYYYYMMDD(date);

    const fromId = this.ensureObjectId(fromLocationId, 'fromLocationId');
    const toId = this.ensureObjectId(toLocationId, 'toLocationId');

    const start = dayjs.tz(dateStr, TZ).startOf('day').toDate();
    const end = dayjs.tz(dateStr, TZ).add(1, 'day').startOf('day').toDate();

    const includeDeparted = options?.includeDeparted ?? true;

    const statuses = includeDeparted
      ? [TripStatus.SCHEDULED, TripStatus.DEPARTED]
      : [TripStatus.SCHEDULED];

    const filter: any = {
      'route.fromLocationId': fromId,
      'route.toLocationId': toId,
      departureTime: { $gte: start, $lt: end },
      status: { $in: statuses },
      isRecurrenceTemplate: false,
    };

    return this.tripModel
      .find(filter)
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name logoUrl status',
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: '_id vehicleNumber type totalSeats status amenities',
      })
      .populate({
        path: 'route.fromLocationId',
        model: 'Location',
        select: '_id name province district address location',
      })
      .populate({
        path: 'route.toLocationId',
        model: 'Location',
        select: '_id name province district address location',
      })
      .sort({ departureTime: 1 })
      .lean()
      .exec();
  }

  async search(filter: any) {
    return this.tripModel
      .find(filter)
      .populate({ path: 'route.fromLocationId', model: 'Location' })
      .populate({ path: 'route.toLocationId', model: 'Location' })
      .populate({ path: 'companyId', model: 'Company' })
      .sort({ departureTime: 1 })
      .lean()
      .exec();
  }

  async searchByRoute(fromId: string, toId: string) {
    const f = this.ensureObjectId(fromId, 'fromId');
    const t = this.ensureObjectId(toId, 'toId');

    return this.tripModel
      .find({
        'route.fromLocationId': f,
        'route.toLocationId': t,
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
    const f = this.ensureObjectId(fromId, 'fromId');

    return this.tripModel
      .find({
        'route.fromLocationId': f,
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

  async hasActiveTripsForVehicle(vehicleId: string): Promise<boolean> {
    const vId = this.ensureObjectId(vehicleId, 'vehicleId');

    const count = await this.tripModel
      .countDocuments({
        vehicleId: vId,
        status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      })
      .exec();

    return count > 0;
  }

  async updateStopStatus(
    tripId: string,
    locationId: string,
    status: TripStopStatus,
  ): Promise<any | null> {
    const tId = this.ensureObjectId(tripId, 'tripId');
    const lId = this.ensureObjectId(locationId, 'locationId');

    return this.tripModel
      .findOneAndUpdate(
        {
          _id: tId,
          'route.stops.locationId': lId,
        },
        {
          $set: { 'route.stops.$.status': status },
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
  }

  async updateManyStatus(
    filter: QueryFilter<TripDocument>,
    newStatus: TripStatus,
  ): Promise<any> {
    return this.tripModel
      .updateMany(filter, { $set: { status: newStatus } })
      .exec();
  }
}
