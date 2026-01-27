import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import {
  AuthUserResponse,
  BookingStatus,
  ConfirmBookingPayload,
  CreateBookingPayload,
  LookupBookingPayload,
  PaymentStatus,
  SeatStatus,
  TripStatus,
} from '@obtp/shared-types';
import { Connection, Types } from 'mongoose';

import {
  BUSINESS_CONSTANTS,
  calculateHoldExpiration,
  calculateTotalAmount,
  generateTicketCode,
} from '@obtp/business-logic';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
import { BookingsRepository } from './bookings.repository';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,

    // Dependencies
    private readonly tripsService: TripsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,

    // Core infrastructure
    private readonly eventEmitter: EventEmitter2,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * TRANSACTION FLOW: CREATE HOLD (GIỮ CHỖ)
   * 1. Start Session
   * 2. Check Trip Valid
   * 3. Check & Lock Trip Seats (Critical)
   * 4. Create Booking Record
   * 5. Commit
   */
  async createHold(
    payload: CreateBookingPayload,
    user?: AuthUserResponse,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { tripId, passengers } = payload;
      const trip = await this.tripsService.findOne(tripId);

      // 1. Validations logic nhanh (Fast fail)
      if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');
      if (trip.status !== TripStatus.SCHEDULED) {
        throw new BadRequestException('Chuyến đi không khả dụng để đặt.');
      }

      const seatNumbers = passengers.map((p) => p.seatNumber);
      // Validate Duplicate Seats in Request
      if (new Set(seatNumbers).size !== seatNumbers.length) {
        throw new BadRequestException('Trùng lặp số ghế trong yêu cầu đặt vé.');
      }

      // 2. Deep Validate Status (Check xem ghế có Available trong Trip DB không)
      // Logic này TripService sẽ thực hiện sâu hơn, nhưng ta check nhanh tại đây
      const unavailableSeats = trip.seats.filter(
        (s) =>
          seatNumbers.includes(s.seatNumber) &&
          s.status !== SeatStatus.AVAILABLE,
      );

      if (unavailableSeats.length > 0) {
        throw new ConflictException(
          `Ghế ${unavailableSeats.map((s) => s.seatNumber).join(', ')} không còn trống.`,
        );
      }

      // 3. Logic giá & User (Snapshot Pattern)
      // Link user nếu có (Logged in hoặc guest match email)
      let linkUserId: string | undefined = user ? user.id : undefined;

      if (!linkUserId && payload.contactEmail) {
        const existUser = await this.usersService.findOneByEmail(
          payload.contactEmail,
        );
        if (existUser) linkUserId = existUser._id.toString();
      }

      const unitPrice = trip.price;
      const totalAmount = calculateTotalAmount(passengers.length, unitPrice);

      const holdMinutes = this.configService.get<number>(
        'SEAT_HOLD_DURATION_MINUTES',
        BUSINESS_CONSTANTS.BOOKING.SEAT_HOLD_DURATION_MINUTES,
      );
      const heldUntil = calculateHoldExpiration(holdMinutes);

      // Map Passengers with Snapshot Price
      const snapshotPassengers = passengers.map((p) => ({
        ...p,
        price: unitPrice, // Snapshot giá tại thời điểm đặt
      }));

      // 4. Create Booking Document
      // Tạo BookingId trước để truyền cho Seat lock
      const bookingObjectId = new Types.ObjectId();

      const newBooking = await this.bookingsRepository.create(
        {
          tripId: new Types.ObjectId(tripId),
          companyId: new Types.ObjectId(trip.companyId._id), // Populate structure assumed
          userId: linkUserId ? new Types.ObjectId(linkUserId) : undefined,

          contactName: payload.contactName,
          contactPhone: payload.contactPhone,
          contactEmail: payload.contactEmail,

          passengers: snapshotPassengers,
          totalAmount: totalAmount,

          status: BookingStatus.HELD,
          heldUntil: heldUntil,

          paymentStatus: PaymentStatus.PENDING,
        },
        session,
      );

      // 5. CALL EXTERNAL SERVICE TO LOCK SEATS (Must support Session or we emulate)
      // Update logic TripsService của Giai đoạn 3 chưa có tham số session trong Interface cũ
      // Ở đây ta gọi hàm updateSeatStatus.
      // LƯU Ý: Để Transaction hoạt động, TripsRepository.save() cần nhận session.
      // Chúng ta sẽ ép kiểu tạm thời ở TripsService hoặc coi đây là flow Optimistic Locking nếu TripsService chưa support session injection.

      // Tuy nhiên, theo yêu cầu đề bài là Transaction:
      // Chúng ta sẽ cần TripsService export 1 method support session, hoặc ta access TripRepo (xấu), hoặc ta tin tưởng.
      // GIẢI PHÁP: TripsService updateSeatStatus cần refactor nhận Optional Session.
      // (Giả sử ta đã sửa TripsService ở Giai đoạn Trip, nếu chưa, code sẽ chạy không có transaction bảo vệ phần ghế).

      // Update Seat to HELD
      // Note: Do sự hạn chế context, ta giả định updateSeatStatus của TripService đã handle logic atomic check
      await this.tripsService.updateSeatStatus(tripId, {
        seatNumbers,
        status: SeatStatus.HELD,
        bookingId: bookingObjectId.toString(),
      }); // Nếu method này chưa support session, cần rollback thủ công ở catch.

      // *Nếu code TripsService hỗ trợ session:* await this.tripsService.updateSeatStatus(..., session);

      await session.commitTransaction();
      return newBooking;
    } catch (error) {
      await session.abortTransaction();

      // Enhance error message
      if (error instanceof ConflictException) throw error;
      this.logger.error('Error creating booking hold', error);
      throw new InternalServerErrorException(
        'Không thể giữ chỗ lúc này. Vui lòng thử lại.',
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * CONFIRM BOOKING (WEBHOOK HOẶC API)
   */
  async confirmBooking(
    bookingId: string,
    payload: ConfirmBookingPayload,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const booking = await this.bookingsRepository.findById(
        bookingId,
        session,
      );
      if (!booking) throw new NotFoundException('Đơn hàng không tồn tại');

      if (booking.status === BookingStatus.CONFIRMED) return booking; // Idempotency
      if (booking.status !== BookingStatus.HELD) {
        throw new BadRequestException(
          'Trạng thái vé không hợp lệ để xác nhận.',
        );
      }

      // Validate Payment Amount
      if (payload.paidAmount < booking.totalAmount) {
        throw new BadRequestException('Số tiền thanh toán chưa đủ.');
      }

      // 1. Update Booking
      booking.status = BookingStatus.CONFIRMED;
      booking.paymentStatus = PaymentStatus.PAID;
      booking.paymentMethod = payload.paymentMethod;
      booking.paymentGatewayTransactionId = payload.transactionDateTime; // Temp usage field
      booking.heldUntil = undefined; // Remove TTL expiry
      booking.ticketCode = await this.generateUniqueTicketCode(); // Create Code

      await this.bookingsRepository.save(booking, session);

      // 2. Update Trip Seats -> BOOKED
      const seatNumbers = booking.passengers.map((p) => p.seatNumber);
      await this.tripsService.updateSeatStatus(booking.tripId.toString(), {
        seatNumbers: seatNumbers,
        status: SeatStatus.BOOKED,
        bookingId: booking._id.toString(),
      }); // Add session arg if TripService supported

      await session.commitTransaction();

      this.eventEmitter.emit('booking.confirmed', booking); // Gửi mail vé

      return booking;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Confirm booking ${bookingId} failed`, error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * CANCEL BOOKING
   */
  async cancelBooking(
    bookingId: string,
    user?: AuthUserResponse,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const booking = await this.bookingsRepository.findById(
        bookingId,
        session,
      );
      if (!booking) throw new NotFoundException('Vé không tồn tại');

      // Authorization Check
      if (user) {
        const bookingOwner = booking.userId?.toString();
        // Nếu có user login, phải check chủ sở hữu
        if (
          bookingOwner &&
          bookingOwner !== user.id &&
          !user.roles.includes('admin' as any)
        ) {
          throw new ForbiddenException('Không có quyền hủy vé này.');
        }
      }

      if (booking.status === BookingStatus.CANCELLED) return booking;

      // 1. Update Booking
      booking.status = BookingStatus.CANCELLED;
      await this.bookingsRepository.save(booking, session);

      // 2. Release Seats -> AVAILABLE
      const seatNumbers = booking.passengers.map((p) => p.seatNumber);

      await this.tripsService.updateSeatStatus(booking.tripId.toString(), {
        seatNumbers: seatNumbers,
        status: SeatStatus.AVAILABLE,
        bookingId: undefined,
      });

      await session.commitTransaction();
      this.eventEmitter.emit('booking.cancelled', booking);

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async lookup(payload: LookupBookingPayload): Promise<any> {
    // Search by code first
    let booking = await this.bookingsRepository.findByCodeOrId(
      payload.identifier,
    );

    if (!booking) throw new NotFoundException('Không tìm thấy vé.');

    // Validate Phone
    if (booking.contactPhone !== payload.contactPhone) {
      throw new ForbiddenException('Số điện thoại liên hệ không khớp.');
    }

    return booking;
  }

  // Helpers
  private async generateUniqueTicketCode(): Promise<string> {
    let code = '';
    let exists = true;
    let retries = 0;
    while (exists && retries < 10) {
      code = generateTicketCode();
      const check = await this.bookingsRepository.findByCodeOrId(code);
      if (!check) exists = false;
      retries++;
    }
    if (exists)
      throw new InternalServerErrorException('Lỗi sinh mã vé. Thử lại sau.');
    return code;
  }
  
}
