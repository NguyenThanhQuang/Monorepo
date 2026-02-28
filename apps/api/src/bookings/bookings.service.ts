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
import {
  BUSINESS_CONSTANTS,
  calculateHoldExpiration,
  calculateTotalAmount,
  generateTicketCode,
} from '@obtp/business-logic';
import {
  AuthUserResponse,
  BookingStatus,
  ConfirmBookingPayload,
  CreateBookingPayload,
  LookupBookingPayload,
  PaymentStatus,
  SeatStatus,
  TripStatus,
  UserRole,
} from '@obtp/shared-types';
import { Types } from 'mongoose';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
import { BookingsRepository } from './bookings.repository';
import { BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly tripsService: TripsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ============================ HELPERS ============================ */

  // ✅ Chấp nhận cả string / ObjectId / populated object
  private isObjectId(id: any) {
    return Types.ObjectId.isValid(id);
  }

  // ✅ Extract id từ populated object hoặc ObjectId hoặc string
  private extractId(raw: any): string {
    if (!raw) return '';
    if (typeof raw === 'string') return raw.trim();
    if (raw instanceof Types.ObjectId) return raw.toString();

    if (typeof raw === 'object') {
      const v = raw?._id ?? raw?.id;
      if (v instanceof Types.ObjectId) return v.toString();
      if (typeof v === 'string') return v.trim();
    }
    return '';
  }

  // ✅ Convert an toàn: nếu đã là ObjectId thì dùng luôn, nếu là string thì new ObjectId
  private toObjectId(raw: any, fieldName: string) {
    const id = this.extractId(raw);
    if (!this.isObjectId(id))
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    return new Types.ObjectId(id);
  }

  /* ============================ COMPANY BOOKINGS ============================ */

  async getBookingsByCompany(user: AuthUserResponse) {
    if (!user.companyId) {
      throw new ForbiddenException('User không thuộc company nào.');
    }
    return this.bookingsRepository.findByCompanyId(user.companyId);
  }

  /**
   * CREATE HOLD (GIỮ CHỖ)
   * ⚠️ Mongo standalone KHÔNG hỗ trợ transaction -> không dùng session/startTransaction
   * Flow:
   * 1) Validate trip + seats available
   * 2) Create booking
   * 3) Update seats -> HELD (bookingId = _id thật)
   * 4) Nếu update seat lỗi -> rollback thủ công: xóa booking vừa tạo + throw error
   */
  async createHold(
    payload: CreateBookingPayload,
    user?: AuthUserResponse,
  ): Promise<BookingDocument> {
    let createdBooking: BookingDocument | null = null;

    try {
      const { tripId, passengers } = payload;

      // ✅ validate tripId sớm
      if (!this.isObjectId(tripId)) {
        throw new BadRequestException('tripId không hợp lệ.');
      }

      if (!Array.isArray(passengers) || passengers.length === 0) {
        throw new BadRequestException('Danh sách hành khách không hợp lệ.');
      }

      // 1) Fetch trip
      const trip: any = await this.tripsService.findOne(String(tripId));
      if (!trip) throw new NotFoundException('Chuyến đi không tồn tại.');
      if (trip.status !== TripStatus.SCHEDULED) {
        throw new BadRequestException('Chuyến đi không khả dụng để đặt.');
      }

      // ✅ companyId có thể populated/objectId/string
      const companyIdStr = this.extractId(trip.companyId);
      if (!this.isObjectId(companyIdStr)) {
        throw new InternalServerErrorException(
          'companyId của trip không hợp lệ.',
        );
      }

      // 2) Validate seatNumbers
      const seatNumbers = passengers.map((p: any) =>
        String(p?.seatNumber ?? '').trim(),
      );
      if (seatNumbers.some((s) => !s)) {
        throw new BadRequestException('seatNumber không hợp lệ.');
      }
      if (new Set(seatNumbers).size !== seatNumbers.length) {
        throw new BadRequestException('Trùng lặp số ghế trong yêu cầu đặt vé.');
      }

      // 3) Check availability
      const tripSeats = Array.isArray(trip.seats) ? trip.seats : [];
      const unavailableSeats = tripSeats.filter(
        (s: any) =>
          seatNumbers.includes(String(s?.seatNumber)) &&
          s?.status !== SeatStatus.AVAILABLE,
      );

      if (unavailableSeats.length > 0) {
        throw new ConflictException(
          `Ghế ${unavailableSeats.map((s: any) => s.seatNumber).join(', ')} không còn trống.`,
        );
      }

      // 4) Link user
      let linkUserId: string | undefined = user?.id;

      if (!linkUserId && payload.contactEmail) {
        const existUser = await this.usersService.findOneByEmail(
          payload.contactEmail,
        );
        if (existUser) linkUserId = this.extractId(existUser._id);
      }

      if (linkUserId && !this.isObjectId(linkUserId)) {
        throw new BadRequestException('userId không hợp lệ.');
      }

      // 5) Money + hold time
      const unitPrice = Number(trip.price ?? 0);
      const totalAmount = calculateTotalAmount(passengers.length, unitPrice);

      const holdMinutes = this.configService.get<number>(
        'SEAT_HOLD_DURATION_MINUTES',
        BUSINESS_CONSTANTS.BOOKING.SEAT_HOLD_DURATION_MINUTES,
      );
      const heldUntil = calculateHoldExpiration(holdMinutes);

      const snapshotPassengers = passengers.map((p: any) => ({
        ...p,
        seatNumber: String(p.seatNumber).trim(),
        price: unitPrice,
      }));

      // 6) Create booking (NO session)
      createdBooking = await this.bookingsRepository.create({
        tripId: this.toObjectId(tripId, 'tripId'),
        companyId: this.toObjectId(companyIdStr, 'companyId'),
        userId: linkUserId ? this.toObjectId(linkUserId, 'userId') : undefined,

        contactName: String(payload.contactName ?? '').trim(),
        contactPhone: String(payload.contactPhone ?? '').trim(),
        contactEmail: payload.contactEmail?.trim() || undefined,

        passengers: snapshotPassengers,
        totalAmount,

        status: BookingStatus.HELD,
        heldUntil,

        paymentStatus: PaymentStatus.PENDING,
      });

      // ✅ bookingId phải là _id thật
      const bookingId = this.extractId((createdBooking as any)?._id);
      if (!this.isObjectId(bookingId)) {
        throw new InternalServerErrorException(
          'Không lấy được bookingId hợp lệ từ booking vừa tạo.',
        );
      }

      // 7) Update seats -> HELD
      await this.tripsService.updateSeatStatus(String(tripId), {
        seatNumbers,
        status: SeatStatus.HELD,
        bookingId,
      });

      return createdBooking;
    } catch (error: any) {
      // ✅ rollback thủ công nếu đã tạo booking nhưng updateSeatStatus fail
      try {
        if (createdBooking?._id) {
          await this.bookingsRepository.deleteById(
            createdBooking._id.toString(),
          );
        }
      } catch (rollbackErr) {
        this.logger.error('Rollback booking failed', rollbackErr as any);
      }

      // giữ nguyên lỗi hữu ích
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Error creating booking hold', error);
      throw new InternalServerErrorException(
        'Không thể giữ chỗ lúc này. Vui lòng thử lại.',
      );
    }
  }

  /**
   * CONFIRM BOOKING
   * ⚠️ Bỏ transaction để chạy được trên Mongo standalone.
   */
  async confirmBooking(
    bookingId: string,
    payload: ConfirmBookingPayload,
  ): Promise<BookingDocument> {
    try {
      if (!this.isObjectId(bookingId)) {
        throw new BadRequestException('bookingId không hợp lệ.');
      }

      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) throw new NotFoundException('Đơn hàng không tồn tại');

      if (booking.status === BookingStatus.CONFIRMED) return booking;
      if (booking.status !== BookingStatus.HELD) {
        throw new BadRequestException(
          'Trạng thái vé không hợp lệ để xác nhận.',
        );
      }

      if (payload.paidAmount < booking.totalAmount) {
        throw new BadRequestException('Số tiền thanh toán chưa đủ.');
      }

      booking.status = BookingStatus.CONFIRMED;
      booking.paymentStatus = PaymentStatus.PAID;
      booking.paymentMethod = payload.paymentMethod;
      booking.paymentGatewayTransactionId = payload.transactionDateTime;
      booking.heldUntil = undefined;
      booking.ticketCode = await this.generateUniqueTicketCode();

      await this.bookingsRepository.save(booking);

      const seatNumbers = booking.passengers.map((p) => p.seatNumber);
      await this.tripsService.updateSeatStatus(booking.tripId.toString(), {
        seatNumbers,
        status: SeatStatus.BOOKED,
        bookingId: booking._id.toString(),
      });

      this.eventEmitter.emit('booking.confirmed', booking);
      return booking;
    } catch (error) {
      this.logger.error(`Confirm booking ${bookingId} failed`, error as any);
      throw error;
    }
  }

  /**
   * CANCEL BOOKING
   * ⚠️ Bỏ transaction để chạy được trên Mongo standalone.
   */
  async cancelBooking(
    bookingId: string,
    user?: AuthUserResponse,
  ): Promise<BookingDocument> {
    try {
      if (!this.isObjectId(bookingId)) {
        throw new BadRequestException('bookingId không hợp lệ.');
      }

      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) throw new NotFoundException('Vé không tồn tại');

      if (user) {
        const bookingOwner = booking.userId?.toString();
        const isAdmin = user.roles.includes(UserRole.ADMIN);
        if (bookingOwner && bookingOwner !== user.id && !isAdmin) {
          throw new ForbiddenException('Không có quyền hủy vé này.');
        }
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        throw new BadRequestException(
          'Vé đã thanh toán/đã xác nhận không thể hủy.',
        );
      }
      if (booking.status === BookingStatus.CANCELLED) return booking;

      booking.status = BookingStatus.CANCELLED;

      // ✅ quan trọng: hủy HOLD thì payment coi như fail
      if (booking.paymentStatus !== PaymentStatus.PAID) {
        booking.paymentStatus = PaymentStatus.FAILED;
      }

      // ✅ clear giữ chỗ / mã thanh toán để không kẹt
      booking.heldUntil = undefined;
      booking.paymentOrderCode = undefined;
      booking.paymentGatewayTransactionId = undefined;

      await this.bookingsRepository.save(booking);

      // nhả ghế
      const seatNumbers = booking.passengers.map((p) => p.seatNumber);
      await this.tripsService.updateSeatStatus(booking.tripId.toString(), {
        seatNumbers,
        status: SeatStatus.AVAILABLE,
        bookingId: undefined,
      });

      this.eventEmitter.emit('booking.cancelled', booking);
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async lookup(payload: LookupBookingPayload): Promise<BookingDocument> {
    const booking = await this.bookingsRepository.findByCodeOrId(
      payload.identifier,
    );

    if (!booking) throw new NotFoundException('Không tìm thấy vé.');

    if (booking.contactPhone !== payload.contactPhone) {
      throw new ForbiddenException('Số điện thoại liên hệ không khớp.');
    }

    return booking;
  }

  async getBookingById(
    bookingId: string,
    user?: AuthUserResponse,
  ): Promise<BookingDocument> {
    if (!this.isObjectId(bookingId)) {
      throw new BadRequestException('bookingId không hợp lệ.');
    }

    const booking =
      await this.bookingsRepository.findByIdWithDetails(bookingId);
    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại');

    if (user) {
      const owner = booking.userId?.toString();
      const isAdmin = user.roles.includes(UserRole.ADMIN);
      if (owner && owner !== user.id && !isAdmin) {
        throw new ForbiddenException('Không có quyền xem vé này.');
      }
    }
    return booking;
  }

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

    if (exists) {
      throw new InternalServerErrorException('Lỗi sinh mã vé. Thử lại sau.');
    }

    return code;
  }

  async cancelExpiredHoldSystem(bookingId: string): Promise<void> {
    if (!this.isObjectId(bookingId)) return;

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) return;

    // chỉ xử lý HOLD
    if (booking.status !== BookingStatus.HELD) return;

    // nếu chưa có heldUntil thì coi như không có expiry (an toàn)
    if (!booking.heldUntil) return;

    // chỉ cancel khi quá hạn thật
    if (new Date(booking.heldUntil).getTime() > Date.now()) return;

    booking.status = BookingStatus.CANCELLED;
    booking.paymentStatus = PaymentStatus.FAILED;
    booking.heldUntil = undefined;
    booking.paymentOrderCode = undefined;
    booking.paymentGatewayTransactionId = undefined;

    await this.bookingsRepository.save(booking);

    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    await this.tripsService.updateSeatStatus(booking.tripId.toString(), {
      seatNumbers,
      status: SeatStatus.AVAILABLE,
      bookingId: undefined,
    });

    this.eventEmitter.emit('booking.expired', booking);
  }
}
