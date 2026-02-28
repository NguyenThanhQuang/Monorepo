import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { initializeTripSeats } from '@obtp/business-logic';
import {
  CreateTripPayload,
  SearchTripQuery,
  SeatStatus,
  TripStatus,
  TripStopStatus,
  UpdateTripPayload,
  UpdateTripSeatStatusPayload,
  Vehicle,
  VehicleStatus,
} from '@obtp/shared-types';
import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { BookingsRepository } from 'src/bookings/bookings.repository';
import { LocationsRepository } from 'src/locations/locations.repository';
import { MapsService } from 'src/maps/maps.service';
import { CompaniesService } from '../companies/companies.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TripDocument } from './schemas/trip.schema';
import { TripsRepository } from './trips.repository';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";


dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";

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
    const targetDate = date || dayjs().tz(TZ).format("YYYY-MM-DD");

    const startOfDay = dayjs.tz(targetDate, TZ).startOf("day").toDate();
    const endOfDay = dayjs.tz(targetDate, TZ).add(1, "day").startOf("day").toDate();

    const filter: any = {
      departureTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
      isRecurrenceTemplate: false,
    };

    // dùng repo method sẵn có (management trips) vì đã populate đủ dữ liệu
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

    // NOTE: bạn có import CompanyStatus nhưng đang so sánh string,
    // mình giữ nguyên theo code hiện tại của bạn
    if ((company as any).status !== 'active') {
      throw new BadRequestException('Nhà xe đang ngừng hoạt động.');
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      throw new BadRequestException(
        `Xe ${vehicle.vehicleNumber} không khả dụng.`,
      );
    }

    if (vehicle.companyId.toString() !== companyId) {
      throw new BadRequestException('Xe không thuộc về nhà xe này.');
    }

    const mapInfo = { polyline: '', duration: 0, distance: 0 };

    const vehicleParam: Partial<Vehicle> = {
      ...vehicle.toObject(),
      _id: vehicle._id.toString(),
    } as unknown as Partial<Vehicle>;

    // ✅ FIX: tạo seats đúng biến
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

    console.log('Creating trip with data:', {
      companyId: tripData.companyId,
      vehicleId: tripData.vehicleId,
      companyIdType: typeof tripData.companyId,
      vehicleIdType: typeof tripData.vehicleId,
      companyIdInstance: tripData.companyId instanceof Types.ObjectId,
      vehicleIdInstance: tripData.vehicleId instanceof Types.ObjectId,
    });

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
    console.log('🔍 TripsService.findOne called with ID:', id);

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

    console.log('Service filter:', filter);
    const trips = await this.tripsRepository.findManagementTrips(filter);
    console.log(`Found ${trips.length} trips for management`);

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
}
