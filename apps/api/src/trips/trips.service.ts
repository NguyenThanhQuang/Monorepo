import {
  BadRequestException,
  ConflictException,
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
  VehicleStatus,
} from '@obtp/shared-types';
import { Types } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TripsRepository } from './trips.repository';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly vehiclesService: VehiclesService,
    private readonly companiesService: CompaniesService,
    // private readonly locationsService: LocationsService,
    // private readonly mapsService: MapsService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  // --- CORE LOGIC ---

  async create(payload: CreateTripPayload): Promise<any> {
    const { companyId, vehicleId, route, departureTime, expectedArrivalTime } =
      payload;

    // 1. Validate Time Logic
    const depart = new Date(departureTime);
    const arrive = new Date(expectedArrivalTime);
    if (!isValidTripTime(depart, arrive)) {
      throw new BadRequestException(
        'Thời gian khởi hành phải trước thời gian đến.',
      );
    }

    // 2. Fetch Resources & Validate Status
    const [company, vehicle] = await Promise.all([
      this.companiesService.findOne(companyId),
      this.vehiclesService.findOne(vehicleId),
    ]);

    // Check Company Status
    if (company.status !== 'active')
      throw new BadRequestException('Nhà xe đang ngừng hoạt động.');

    // Check Vehicle Status & Ownership
    if (vehicle.status !== VehicleStatus.ACTIVE)
      throw new BadRequestException(
        `Xe ${vehicle.vehicleNumber} không khả dụng.`,
      );
    if (vehicle.companyId._id.toString() !== companyId)
      throw new BadRequestException('Xe không thuộc về nhà xe này.');

    const mapInfo = { polyline: '', duration: 0, distance: 0 };

    // 4. GENERATE SEATS & CAST TYPES (FIX TYPE ERROR HERE)
    const rawSeats = initializeTripSeats(vehicle);

    // Chuyển đổi bookingId từ string sang ObjectId để khớp với Schema
    const initialSeats = rawSeats.map((seat) => ({
      ...seat,
      bookingId: seat.bookingId
        ? new Types.ObjectId(seat.bookingId)
        : undefined,
    }));

    // 5. Create in DB
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
      seats: initialSeats, // <--- Đã được map đúng Type
      status: TripStatus.SCHEDULED,
      availableSeatsCount: initialSeats.length,
    });
  }

  async findPublicTrips(query: SearchTripQuery): Promise<any[]> {
    const date = new Date(query.date);
    // Logic start/end day in Local Time (VN) handled via dayjs inside Repository or here.
    // Simplifying using UTC dates for now:
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Delegate Search logic to Repository (Optimization)
    const rawTrips = await this.tripsRepository.findPublicTripsByCondition(
      startOfDay,
      endOfDay,
      query.from,
      query.to,
    );

    // Lightweight Transformation (Reviews mapping could be added here if ReviewsService exists)
    return rawTrips.map((trip) => {
      // Tính toán availableSeats runtime nếu cần (dù đã có field cached)
      const availableCount = trip.seats.filter(
        (s: any) => s.status === SeatStatus.AVAILABLE,
      ).length;

      return {
        ...trip,
        seats: undefined, // Hide detailed seat map for list view
        availableSeatsCount: availableCount, // Ensure correct number
      };
    });
  }

  async findOne(id: string): Promise<any> {
    const trip = await this.tripsRepository.findByIdWithDetails(id);
    if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');
    return trip;
  }

  async update(id: string, payload: UpdateTripPayload): Promise<any> {
    const trip = await this.findOne(id);

    // 1. Check restriction
    const hasBookings = trip.seats.some(
      (s) => s.status === SeatStatus.BOOKED || s.status === SeatStatus.HELD,
    );

    // Core fields restrictions
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

  async cancel(id: string): Promise<any> {
    const trip = await this.tripsRepository.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.status === TripStatus.ARRIVED)
      throw new BadRequestException('Cannot cancel arrived trip');

    // 1. Update Trip Status
    trip.status = TripStatus.CANCELLED;

    // Reset seats
    trip.seats.forEach((s) => {
      s.status = SeatStatus.AVAILABLE;
      s.bookingId = undefined;
    });

    // 2. Save
    await this.tripsRepository.save(trip);

    // 3. Emit Event for Booking Module (Decoupling)
    // Booking Service sẽ nghe 'trip.cancelled' để hoàn tiền/đổi trạng thái vé
    this.eventEmitter.emit('trip.cancelled', { tripId: id });

    return trip;
  }

  // --- INTERNAL / SEAT MANAGEMENT ---

  // Hàm này sẽ được gọi bởi Booking Service (thông qua Module Import)
  async updateSeatStatus(
    tripId: string,
    payload: UpdateTripSeatStatusPayload,
  ): Promise<void> {
    const trip = await this.tripsRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Trip not found');

    payload.seatNumbers.forEach((seatNum) => {
      const seat = trip.seats.find((s) => s.seatNumber === seatNum);
      if (seat) {
        // Validate State Transitions (Optional)
        seat.status = payload.status;
        seat.bookingId = payload.bookingId
          ? (payload.bookingId as any)
          : undefined;
      }
    });

    // Re-calc available cache
    trip.availableSeatsCount = trip.seats.filter(
      (s) => s.status === SeatStatus.AVAILABLE,
    ).length;

    await this.tripsRepository.save(trip);
  }

  // Support Admin/Management search
  async findAllForManagement(companyId?: string): Promise<any> {
    const filter: any = {};
    if (companyId) filter.companyId = companyId; // Repository handles Type casting
    return this.tripsRepository.findManagementTrips(filter);
  }

  async toggleRecurrence(id: string, isActive: boolean): Promise<any> {
    const trip = await this.tripsRepository.findById(id);
    if (!trip || !trip.isRecurrenceTemplate)
      throw new BadRequestException('Không phải chuyến đi mẫu.');

    trip.isRecurrenceActive = isActive;
    return this.tripsRepository.save(trip);
  }
}
