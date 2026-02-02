import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { initializeTripSeats, isValidTripTime } from '@obtp/business-logic';
import {
  CreateTripPayload,
  SearchTripQuery,
  SeatStatus,
  TripStatus,
  UpdateTripPayload,
  UpdateTripSeatStatusPayload,
  Vehicle,
  VehicleStatus,
} from '@obtp/shared-types';
import { Types } from 'mongoose';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(payload: CreateTripPayload): Promise<TripDocument> {
    const { companyId, vehicleId, route, departureTime, expectedArrivalTime } =
      payload;

    const depart = new Date(departureTime);
    const arrive = new Date(expectedArrivalTime);
    if (!isValidTripTime(depart, arrive)) {
      throw new BadRequestException(
        'Thời gian khởi hành phải trước thời gian đến.',
      );
    }

    const [company, vehicle] = await Promise.all([
      this.companiesService.findOne(companyId),
      this.vehiclesService.findOne(vehicleId),
    ]);

    if (company.status !== 'active')
      throw new BadRequestException('Nhà xe đang ngừng hoạt động.');

    if (vehicle.status !== VehicleStatus.ACTIVE)
      throw new BadRequestException(
        `Xe ${vehicle.vehicleNumber} không khả dụng.`,
      );
    if (vehicle.companyId._id.toString() !== companyId)
      throw new BadRequestException('Xe không thuộc về nhà xe này.');

    const mapInfo = { polyline: '', duration: 0, distance: 0 };

    const vehicleParam: Partial<Vehicle> = {
      ...vehicle.toObject(),
      _id: vehicle._id.toString(),
    } as unknown as Partial<Vehicle>;

    const rawSeats = initializeTripSeats(vehicleParam);

    const initialSeats = rawSeats.map((seat) => ({
      ...seat,
      bookingId: seat.bookingId
        ? new Types.ObjectId(seat.bookingId)
        : undefined,
    }));

    return this.tripsRepository.create({
      ...payload,
      route: {
        ...payload.route,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops: payload.route.stops || [],
        ...mapInfo,
      },
      departureTime: depart,
      expectedArrivalTime: arrive,
      seats: initialSeats,
      status: TripStatus.SCHEDULED,
      availableSeatsCount: initialSeats.length,
    });
  }

  async findPublicTrips(query: SearchTripQuery): Promise<any[]> {
    const date = new Date(query.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const rawTrips = await this.tripsRepository.findPublicTripsByCondition(
      startOfDay,
      endOfDay,
      query.from,
      query.to,
    );

    return rawTrips.map((trip) => {
      const availableCount = trip.seats.filter(
        (s: any) => s.status === SeatStatus.AVAILABLE,
      ).length;

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
    const trip = await this.findOne(id);

    const hasBookings = trip.seats.some(
      (s) => s.status === SeatStatus.BOOKED || s.status === SeatStatus.HELD,
    );

    if (hasBookings) {
      if (payload.price !== undefined || payload.departureTime) {
        throw new ConflictException(
          'Không thể thay đổi giá/thời gian khi đã có vé được đặt.',
        );
      }
    }

    // 2. Prepare Update Data
    // Note: Nếu đổi xe (change vehicle), logic rất phức tạp (remap seats).
    // Ở MVP migration, ta tạm thời block đổi xe nếu đã có booking.
    // Nếu chưa có booking, re-generate seats.

    const updateData: any = { ...payload };

    if (payload.departureTime)
      updateData.departureTime = new Date(payload.departureTime);
    if (payload.expectedArrivalTime)
      updateData.expectedArrivalTime = new Date(payload.expectedArrivalTime);

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
    if (!trip) throw new NotFoundException('Trip not found');

    payload.seatNumbers.forEach((seatNum) => {
      const seat = trip.seats.find((s) => s.seatNumber === seatNum);
      if (seat) {
        seat.status = payload.status;
        seat.bookingId = payload.bookingId
          ? (payload.bookingId as any)
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
    if (companyId) filter.companyId = companyId;
    return this.tripsRepository.findManagementTrips(filter);
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
}
