import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { initializeTripSeats } from '@obtp/business-logic';
import {
  AuthUserResponse,
  CreateTripPayload,
  GeoPoint,
  SeatStatus,
  TripStatus,
  TripStopStatus,
  UpdateTripPayload,
  UpdateTripSeatStatusPayload,
  Vehicle,
  VehicleStatus,
} from '@obtp/shared-types';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Types } from 'mongoose';
import { BookingsRepository } from '../bookings/bookings.repository';
import { CompaniesService } from '../companies/companies.service';
import { LocationsRepository } from '../locations/locations.repository';
import { MapsService } from '../maps/maps.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TripDocument } from './schemas/trip.schema';
import { TripsRepository } from './trips.repository';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Ho_Chi_Minh';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepository: TripsRepository,
    @Inject(forwardRef(() => VehiclesService))
    private readonly vehiclesService: VehiclesService,
    private readonly companiesService: CompaniesService,
    private readonly mapsService: MapsService,
    private readonly locationsRepository: LocationsRepository,
    @Inject(forwardRef(() => BookingsRepository))
    private readonly bookingsRepository: BookingsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async searchTripsByLocationId(
    fromLocationId: string,
    toLocationId: string,
    date: string,
    options?: { includeDeparted?: boolean },
  ) {
    return this.tripsRepository.searchTripsByLocationId(
      fromLocationId,
      toLocationId,
      date,
      { includeDeparted: options?.includeDeparted ?? true },
    );
  }

  async findActiveTrips(date?: string): Promise<any[]> {
    const targetDate = date || dayjs().tz(TZ).format('YYYY-MM-DD');

    const startOfDay = dayjs.tz(targetDate, TZ).startOf('day').toDate();
    const endOfDay = dayjs
      .tz(targetDate, TZ)
      .add(1, 'day')
      .startOf('day')
      .toDate();

    const filter: any = {
      departureTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      isRecurrenceTemplate: false,
    };

    return this.tripsRepository.findManagementTrips(filter);
  }
  // ✅ Driver: chuyến trong ngày được phân công cho tài xế (userId)
  async findTripsForDriver(
    driverUserId: string,
    date?: string,
  ): Promise<any[]> {
    if (!driverUserId || !Types.ObjectId.isValid(String(driverUserId))) {
      return [];
    }

    const targetDate = date || dayjs().tz(TZ).format('YYYY-MM-DD');
    const startOfDay = dayjs.tz(targetDate, TZ).startOf('day').toDate();
    const endOfDay = dayjs
      .tz(targetDate, TZ)
      .add(1, 'day')
      .startOf('day')
      .toDate();

    const filter: any = {
      driverId: new Types.ObjectId(driverUserId),
      departureTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      isRecurrenceTemplate: false,
    };

    return this.tripsRepository.findManagementTrips(filter);
  }

  async create(payload: CreateTripPayload): Promise<TripDocument> {
    const { companyId, vehicleId, route, departureTime, expectedArrivalTime } =
      payload;

    const depart = new Date(departureTime);
    const arrive = new Date(expectedArrivalTime);

    const [company, vehicle] = await Promise.all([
      this.companiesService.findOne(companyId),
      this.vehiclesService.findOne(vehicleId),
    ]);

    if ((company as any).status !== 'active') {
      throw new BadRequestException('Nhà xe đang ngừng hoạt động.');
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      throw new BadRequestException(
        `Xe ${vehicle.vehicleNumber} không khả dụng.`,
      );
    }

    const rawVehicleCoId = (vehicle.companyId as any)?._id || vehicle.companyId;

    const vehicleCoIdStr = String(rawVehicleCoId).trim();
    const payloadCoIdStr = String(companyId).trim();

    if (vehicleCoIdStr !== payloadCoIdStr) {
      throw new BadRequestException(
        `Xe không thuộc về nhà xe này. (Xe: ${vehicleCoIdStr} vs Yêu cầu: ${payloadCoIdStr})`,
      );
    }

    const mapInfo = { polyline: '', duration: 0, distance: 0 };

    const vehicleParam: Partial<Vehicle> = {
      ...vehicle.toObject(),
      _id: vehicle._id.toString(),
    } as unknown as Partial<Vehicle>;

    const initialSeats = initializeTripSeats(vehicleParam);

    const readySeats = initialSeats.map((s) => ({
      ...s,
      status: SeatStatus.AVAILABLE,
      bookingId: undefined,
    }));

    const stopsData = (route.stops || []).map((stop) => ({
      locationId: stop.locationId,
      expectedArrivalTime: new Date(stop.expectedArrivalTime),
      expectedDepartureTime: stop.expectedDepartureTime
        ? new Date(stop.expectedDepartureTime)
        : undefined,
      status: TripStopStatus.PENDING,
    }));

    const tripData: any = {
      companyId: new Types.ObjectId(companyId),
      vehicleId: new Types.ObjectId(vehicleId),
      route: {
        fromLocationId: new Types.ObjectId(route.fromLocationId),
        toLocationId: new Types.ObjectId(route.toLocationId),
        stops: stopsData.map((stop) => ({
          ...stop,
          locationId: new Types.ObjectId(stop.locationId),
        })),
        ...mapInfo,
      },
      departureTime: depart,
      expectedArrivalTime: arrive,
      price: payload.price,
      status: TripStatus.SCHEDULED,
      availableSeatsCount: readySeats.length,
      isRecurrenceTemplate: payload.isRecurrenceTemplate || false,
      isRecurrenceActive: payload.isRecurrenceTemplate || false,
      seats: readySeats,
    };

    const createdTrip = await this.tripsRepository.create(tripData);
    return createdTrip;
  }

  async findPublicTrips(query: any): Promise<any[]> {
    const startOfDay = dayjs
      .tz(query.date, 'Asia/Ho_Chi_Minh')
      .startOf('day')
      .toDate();
    const endOfDay = dayjs
      .tz(query.date, 'Asia/Ho_Chi_Minh')
      .add(1, 'day')
      .startOf('day')
      .toDate();

    // ✅ ưu tiên theo ID (mobile đang dùng)
    if (query.fromLocationId && query.toLocationId) {
      const trips = await this.tripsRepository.searchTripsByLocationId(
        query.fromLocationId,
        query.toLocationId,
        query.date,
      );

      // searchTripsByLocationId đã populate + lean, nên chỉ cần normalize available
      return trips.map((trip: any) => {
        const availableCount = trip.seats
          ? trip.seats.filter((s: any) => s.status === SeatStatus.AVAILABLE)
              .length
          : (trip.availableSeatsCount ?? 0);

        return {
          ...trip,
          seats: undefined,
          availableSeatsCount: availableCount,
        };
      });
    }

    // ✅ fallback legacy theo string (web/public search cũ)
    if (query.from && query.to) {
      const rawTrips = await this.tripsRepository.findPublicTripsByCondition(
        startOfDay,
        endOfDay,
        query.from,
        query.to,
      );

      return rawTrips.map((trip: any) => {
        const availableCount = trip.seats
          ? trip.seats.filter((s: any) => s.status === SeatStatus.AVAILABLE)
              .length
          : 0;

        return {
          ...trip,
          seats: undefined,
          availableSeatsCount: availableCount,
        };
      });
    }

    // ✅ thiếu params thì báo đúng
    throw new BadRequestException('Missing required search parameters');
  }

  async findOne(id: string): Promise<TripDocument> {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID chuyến đi không hợp lệ.');
      }

      const trip = await this.tripsRepository.findByIdWithDetails(id);

      if (!trip) {
        throw new NotFoundException('Chuyến đi không tồn tại.');
      }

      return trip;
    } catch (error) {
      // ✅ Giữ nguyên các lỗi HTTP bạn đã throw
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;

      // ✅ Lỗi khác (DB, code...) thì nên là 500
      throw new InternalServerErrorException(
        'Không thể lấy thông tin chuyến đi.',
      );
    }
  }

  async update(
    id: string,
    payload: UpdateTripPayload,
  ): Promise<TripDocument | null> {
    const existingTrip = await this.findOne(id);

    const hasActiveBookings = existingTrip.seats.some(
      (s) => s.status === SeatStatus.BOOKED || s.status === SeatStatus.HELD,
    );

    if (hasActiveBookings) {
      if (payload.price !== undefined && payload.price !== existingTrip.price) {
        throw new ConflictException(
          'Không thể đổi giá vé khi đã có người đặt.',
        );
      }

      if (payload.departureTime) {
        const oldTime = new Date(existingTrip.departureTime).getTime();
        const newTime = new Date(payload.departureTime).getTime();
        if (oldTime !== newTime) {
          throw new ConflictException(
            'Không thể đổi giờ khởi hành khi đã có vé được đặt.',
          );
        }
      }
    }

    const updateData: any = {};
    if (payload.status) updateData.status = payload.status;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.departureTime)
      updateData.departureTime = new Date(payload.departureTime);
    if (payload.expectedArrivalTime)
      updateData.expectedArrivalTime = new Date(payload.expectedArrivalTime);

    if (payload.isRecurrenceActive !== undefined)
      updateData.isRecurrenceActive = payload.isRecurrenceActive;

    if (payload.isRecurrenceTemplate !== undefined)
      updateData.isRecurrenceTemplate = payload.isRecurrenceTemplate;

    return this.tripsRepository.update(id, updateData);
  }

  async cancel(id: string): Promise<TripDocument> {
    const trip = await this.tripsRepository.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.status === TripStatus.ARRIVED)
      throw new BadRequestException('Cannot cancel arrived trip');

    trip.status = TripStatus.CANCELLED;

    trip.seats.forEach((s) => {
      s.status = SeatStatus.AVAILABLE;
      s.bookingId = undefined;
    });

    await this.tripsRepository.save(trip);
    this.eventEmitter.emit('trip.cancelled', { tripId: id });

    return trip;
  }

  async updateSeatStatus(
    tripId: string,
    payload: UpdateTripSeatStatusPayload,
  ): Promise<void> {
    const trip = await this.tripsRepository.findById(tripId);
    if (!trip) throw new NotFoundException();

    payload.seatNumbers.forEach((num) => {
      const seat = trip.seats.find((s) => s.seatNumber === num);
      if (seat) {
        seat.status = payload.status;
        seat.bookingId = payload.bookingId
          ? new Types.ObjectId(payload.bookingId)
          : undefined;
      }
    });

    trip.availableSeatsCount = trip.seats.filter(
      (s) => s.status === SeatStatus.AVAILABLE,
    ).length;

    await this.tripsRepository.save(trip);
  }

  async findAllForManagement(companyId?: string): Promise<TripDocument[]> {
    const filter: any = {};

    if (companyId) {
      filter.companyId = new Types.ObjectId(companyId);
    }

    const trips = await this.tripsRepository.findManagementTrips(filter);

    return trips;
  }

  async search(fromId: string, toId: string, date: string) {
    if (!fromId || !toId || !date) {
      throw new BadRequestException('Missing search params');
    }

    return this.tripsRepository.search({
      from: fromId,
      to: toId,
      date,
      isActive: true,
    });
  }

  // ✅ FIX: xóa duplicate check + xóa return bị rơi ra ngoài
  async searchByFrom(fromId: string) {
    if (!fromId) {
      throw new BadRequestException('Missing fromId');
    }
    return this.tripsRepository.searchByFrom(fromId);
  }

  async searchByRoute(fromId: string, toId: string) {
    if (!fromId || !toId) {
      throw new BadRequestException('Missing route params');
    }
    return this.tripsRepository.searchByRoute(fromId, toId);
  }

  async toggleRecurrence(
    id: string,
    isActive: boolean,
  ): Promise<TripDocument | null> {
    const trip = await this.tripsRepository.findById(id);
    if (!trip || !trip.isRecurrenceTemplate) {
      throw new BadRequestException('Không phải chuyến đi mẫu.');
    }

    trip.isRecurrenceActive = isActive;
    return this.tripsRepository.save(trip);
  }

  async checkVehicleHasActiveTrips(vehicleId: string): Promise<boolean> {
    return this.tripsRepository.hasActiveTripsForVehicle(vehicleId);
  }

  async findPopularRoutes(limit = 5) {
    return this.bookingsRepository.getPopularRoutes(limit);
  }

  async updateTripStopStatus(
    tripId: string,
    stopLocationId: string,
    status: TripStopStatus,
  ) {
    const result = await this.tripsRepository.updateStopStatus(
      tripId,
      stopLocationId,
      status,
    );
    if (!result) {
      throw new NotFoundException('Không tìm thấy chuyến hoặc trạm.');
    }
    return result;
  }

  async assignDriver(
    tripId: string,
    driverId: string,
  ): Promise<TripDocument | null> {
    const trip = await this.findOne(tripId);

    // Check trip.status === TripStatus.SCHEDULED

    return this.tripsRepository.update(tripId, {
      $set: { driverId: new Types.ObjectId(driverId) },
    } as any);
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ Map route + live location
  // ─────────────────────────────────────────────────────────────
  private toGeoPointFromLocationDoc(loc: any): GeoPoint | null {
    const coords = loc?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  async getRouteForTrip(tripId: string) {
    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      throw new BadRequestException('TripId không hợp lệ.');
    }

    const trip: any = await this.tripsRepository.findByIdWithDetails(tripId);
    if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');

    // Nếu trip đã có polyline thì trả luôn
    if (trip?.route?.polyline) {
      return {
        polyline: trip.route.polyline,
        distance: Number(trip.route.distance || 0),
        duration: Number(trip.route.duration || 0),
      };
    }

    const from = this.toGeoPointFromLocationDoc(trip?.route?.fromLocationId);
    const to = this.toGeoPointFromLocationDoc(trip?.route?.toLocationId);
    const stops: any[] = Array.isArray(trip?.route?.stops)
      ? trip.route.stops
      : [];
    const stopPoints = stops
      .map((s) => this.toGeoPointFromLocationDoc(s?.locationId))
      .filter(Boolean) as GeoPoint[];

    if (!from || !to) {
      throw new BadRequestException(
        'Thiếu tọa độ điểm đi/đến để tính lộ trình.',
      );
    }

    const waypoints: GeoPoint[] = [from, ...stopPoints, to];
    const routeInfo = await this.mapsService.getRouteInfo(waypoints);

    // Cache vào trip để lần sau khỏi gọi lại
    await this.tripsRepository.update(tripId, {
      $set: {
        'route.polyline': routeInfo.polyline,
        'route.distance': routeInfo.distance,
        'route.duration': routeInfo.duration,
      },
    } as any);

    return routeInfo;
  }

  async updateLiveLocation(
    tripId: string,
    payload: { lat: number; lng: number; heading?: number; speed?: number },
    user?: AuthUserResponse,
  ) {
    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      throw new BadRequestException('TripId không hợp lệ.');
    }

    const lat = Number((payload as any)?.lat);
    const lng = Number((payload as any)?.lng);
    const heading =
      payload?.heading === undefined ? undefined : Number(payload.heading);
    const speed =
      payload?.speed === undefined ? undefined : Number(payload.speed);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('lat/lng không hợp lệ.');
    }

    // Optional: chặn driver update nhầm chuyến
    const trip = await this.tripsRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');

    if (user?.roles?.includes('driver' as any) && trip.driverId) {
      const assigned = String(trip.driverId);
      const me = String((user as any)?.id || (user as any)?._id || '');
      if (me && assigned && assigned !== me) {
        // Không throw quá cứng nếu bạn chưa gán driverId trong DB
        // throw new ForbiddenException('Bạn không được phân công cho chuyến này.');
      }
    }

    const updatedAt = new Date();

    const updated = await this.tripsRepository.update(tripId, {
      $set: {
        currentLocation: { type: 'Point', coordinates: [lng, lat] },
        currentHeading: Number.isFinite(heading as any) ? heading : undefined,
        currentSpeed: Number.isFinite(speed as any) ? speed : undefined,
        currentLocationUpdatedAt: updatedAt,
      },
    } as any);

    return {
      tripId,
      lat,
      lng,
      heading: Number.isFinite(heading as any) ? heading : null,
      speed: Number.isFinite(speed as any) ? speed : null,
      updatedAt,
      saved: !!updated,
    };
  }

  async getLiveLocation(tripId: string) {
    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      throw new BadRequestException('TripId không hợp lệ.');
    }

    const trip: any = await this.tripsRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');

    const coords = trip?.currentLocation?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      return {
        lat: null,
        lng: null,
        heading: null,
        speed: null,
        updatedAt: trip?.currentLocationUpdatedAt ?? null,
      };
    }

    return {
      lat: Number(coords[1]),
      lng: Number(coords[0]),
      heading: trip?.currentHeading ?? null,
      speed: trip?.currentSpeed ?? null,
      updatedAt: trip?.currentLocationUpdatedAt ?? null,
    };
  }
}
