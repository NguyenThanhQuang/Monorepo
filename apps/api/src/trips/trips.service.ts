import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { initializeTripSeats } from '@obtp/business-logic';
import {
  CompanyStatus,
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

  async create(payload: CreateTripPayload): Promise<TripDocument> {
    const { companyId, vehicleId, route, departureTime, expectedArrivalTime } =
      payload;

    const depart = new Date(departureTime);
    const arrive = new Date(expectedArrivalTime);
    if (depart >= arrive) {
      throw new BadRequestException(
        'Thời gian khởi hành phải trước thời gian đến.',
      );
    }

    const stopLocationIds = (route.stops || []).map((s) => s.locationId);
    const allLocationIds = [
      route.fromLocationId,
      route.toLocationId,
      ...stopLocationIds,
    ];

    const [company, vehicle] = await Promise.all([
      this.companiesService.findOne(companyId),
      this.vehiclesService.findOne(vehicleId),
    ]);

    if (company.status !== CompanyStatus.ACTIVE) {
      throw new BadRequestException(`Nhà xe đang ngừng hoạt động.`);
    }
    if (vehicle.status !== VehicleStatus.ACTIVE) {
      throw new BadRequestException(
        `Xe ${vehicle.vehicleNumber} đang không khả dụng.`,
      );
    }

    const vehicleCompanyId = vehicle.companyId._id
      ? vehicle.companyId._id.toString()
      : vehicle.companyId.toString();

    if (vehicleCompanyId !== companyId) {
      throw new BadRequestException('Xe này không thuộc về nhà xe đã chọn.');
    }

    const fromLoc = await this.locationsRepository.findById(
      route.fromLocationId,
    );
    const toLoc = await this.locationsRepository.findById(route.toLocationId);

    if (!fromLoc || !toLoc) {
      throw new BadRequestException('Điểm đi hoặc điểm đến không tồn tại.');
    }

    let mapInfo = { polyline: '', duration: 0, distance: 0 };
    try {
      const routeData = await this.mapsService.getRouteInfo([
        {
          lat: fromLoc.location.coordinates[1],
          lng: fromLoc.location.coordinates[0],
        },
        {
          lat: toLoc.location.coordinates[1],
          lng: toLoc.location.coordinates[0],
        },
      ]);
      mapInfo = routeData;
    } catch (error) {
      console.warn(
        `[TripsService] Không thể lấy lộ trình từ Maps: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
    const initialSeats = initializeTripSeats(vehicleObj as unknown as Vehicle);

    const readySeats = initialSeats.map((s) => ({
      ...s,
      status: SeatStatus.AVAILABLE,
    }));

    const stopsData = (route.stops || []).map((stop) => ({
      locationId: new Types.ObjectId(stop.locationId),
      expectedArrivalTime: new Date(stop.expectedArrivalTime),
      expectedDepartureTime: stop.expectedDepartureTime
        ? new Date(stop.expectedDepartureTime)
        : undefined,
      status: TripStopStatus.PENDING,
    }));

    return this.tripsRepository.create({
      companyId: new Types.ObjectId(companyId),
      vehicleId: new Types.ObjectId(vehicleId),
      route: {
        fromLocationId: new Types.ObjectId(route.fromLocationId),
        toLocationId: new Types.ObjectId(route.toLocationId),
        stops: stopsData,
        ...mapInfo,
      },
      departureTime: depart,
      expectedArrivalTime: arrive,
      price: payload.price,
      status: TripStatus.SCHEDULED,
      availableSeatsCount: readySeats.length,
      isRecurrenceTemplate: payload.isRecurrenceTemplate || false,
      isRecurrenceActive: payload.isRecurrenceTemplate || false,
    });
  }

  async findPublicTrips(query: SearchTripQuery): Promise<any[]> {
    const date = new Date(query.date);
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const rawTrips = await this.tripsRepository.findPublicTripsByCondition(
      startOfDay,
      endOfDay,
      query.from,
      query.to,
    );

    return rawTrips.map((trip) => {
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

  async findOne(id: string): Promise<TripDocument> {
    const trip = await this.tripsRepository.findByIdWithDetails(id);
    if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');
    return trip;
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
          ? (new Types.ObjectId(payload.bookingId) as any)
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

    return this.tripsRepository.findManagementTrips(filter);
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
    if (!trip || !trip.isRecurrenceTemplate)
      throw new BadRequestException('Không phải chuyến đi mẫu.');

    trip.isRecurrenceActive = isActive;
    return this.tripsRepository.save(trip);
  }

  async checkVehicleHasActiveTrips(vehicleId: string): Promise<boolean> {
    return this.tripsRepository.hasActiveTripsForVehicle(vehicleId);
  }

  async findPopularRoutes(limit = 5) {
    // Logic cũ bạn dùng bookingModel.aggregate trực tiếp.
    // Tốt nhất: Viết hàm getTopRoutes ở BookingsRepository rồi gọi sang.
    // Ở đây tôi giả định bạn gọi qua Repository của module Booking
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
    if (!result)
      throw new NotFoundException('Không tìm thấy chuyến hoặc trạm.');
    return result;
  }
}
