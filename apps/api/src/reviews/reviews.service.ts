import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthUserResponse,
  CreateGuestReviewPayload,
  CreateReviewPayload,
  ReviewQuery,
  TripStatus,
  UpdateUserReviewPayload,
} from '@obtp/shared-types';
import dayjs from 'dayjs';
import { Types } from 'mongoose';

import { BUSINESS_CONSTANTS } from '@obtp/business-logic';
import { BookingsRepository } from '../bookings/bookings.repository';
import { BookingsService } from '../bookings/bookings.service';
import { TripsService } from '../trips/trips.service';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly bookingsService: BookingsService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly tripsService: TripsService,
    private readonly configService: ConfigService,
  ) {}

  // Helper Logic Check chung
  private async validateAndGetResources(bookingId: string, tripId: string) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');

    if (booking.tripId.toString() !== tripId) {
      throw new BadRequestException(
        'Thông tin booking và chuyến đi không khớp.',
      );
    }

    // Check duplicate
    const exist = await this.reviewsRepository.existsByBookingId(bookingId);
    if (exist) throw new ConflictException('Booking này đã được đánh giá.');

    const trip = await this.tripsService.findOne(tripId);
    if (trip.status !== TripStatus.ARRIVED) {
      throw new BadRequestException(
        'Chuyến đi chưa hoàn thành, chưa thể đánh giá.',
      );
    }

    return { booking, trip };
  }
  async findByUserId(userId: string) {
    return this.reviewsRepository.findByUserId(
      new Types.ObjectId(userId),
    );
  }
  async create(
    payload: CreateReviewPayload,
    user: AuthUserResponse,
  ): Promise<any> {
    const { booking, trip } = await this.validateAndGetResources(
      payload.bookingId,
      payload.tripId,
    );

    // Verify Owner
    if (!booking.userId || booking.userId.toString() !== user.id) {
      throw new ForbiddenException(
        'Booking này không thuộc tài khoản của bạn.',
      );
    }

    // Create Review
    const review = await this.reviewsRepository.create({
      userId: new Types.ObjectId(user.id),
      bookingId: new Types.ObjectId(payload.bookingId),
      tripId: new Types.ObjectId(payload.tripId),
      companyId: trip.companyId._id ? trip.companyId._id : trip.companyId,

      rating: payload.rating,
      comment: payload.comment,
      isAnonymous: !!payload.isAnonymous,

      displayName: payload.isAnonymous
        ? `${user.name.charAt(0).toUpperCase()}***`
        : user.name,
    });

    // Update Link in Booking
    booking.reviewId = review._id;
    // Dùng repository để save document booking đã fetch
    await this.bookingsRepository.save(booking);

    return review;
  }

  async createAsGuest(payload: CreateGuestReviewPayload): Promise<any> {
    const { booking, trip } = await this.validateAndGetResources(
      payload.bookingId,
      payload.tripId,
    );

    // Verify Owner via Phone (Simple check for Guest)
    if (booking.contactPhone !== payload.contactPhone) {
      throw new ForbiddenException(
        'Số điện thoại xác thực không khớp với đơn đặt vé.',
      );
    }

    const review = await this.reviewsRepository.create({
      // Guest review has no userId
      bookingId: new Types.ObjectId(payload.bookingId),
      tripId: new Types.ObjectId(payload.tripId),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      companyId: trip.companyId._id ? trip.companyId._id : trip.companyId,

      rating: payload.rating,
      comment: payload.comment,
      isAnonymous: !!payload.isAnonymous,

      displayName: payload.isAnonymous
        ? `${booking.contactName.charAt(0).toUpperCase()}***`
        : booking.contactName,
    });

    booking.reviewId = review._id;
    await this.bookingsRepository.save(booking);

    return review;
  }

  async updateReview(
    id: string,
    user: AuthUserResponse,
    payload: UpdateUserReviewPayload,
  ): Promise<any> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');

    if (!review.userId || review.userId.toString() !== user.id) {
      throw new ForbiddenException('Không có quyền chỉnh sửa.');
    }

    if (review.editCount > 0) {
      throw new ForbiddenException('Chỉ được phép chỉnh sửa đánh giá 1 lần.');
    }

    // Check window time logic (From config or Constant default)
    const windowDays = this.configService.get<number>(
      'REVIEW_EDIT_WINDOW_DAYS',
      BUSINESS_CONSTANTS.REVIEW.EDIT_WINDOW_DAYS,
    );
    const isExpired = dayjs().diff(dayjs(review.createdAt), 'day') > windowDays;

    if (isExpired)
      throw new ForbiddenException(
        `Quá thời hạn chỉnh sửa (${windowDays} ngày).`,
      );

    // Update
    if (payload.rating) review.rating = payload.rating;
    if (payload.comment !== undefined) review.comment = payload.comment;

    review.editCount += 1;
    review.lastEditedAt = new Date();

    return this.reviewsRepository.save(review);
  }

  // READ OPERATIONS
  async findAllPublic(query: ReviewQuery): Promise<any[]> {
    const filter: any = { isVisible: true };

    if (query.companyId) filter.companyId = new Types.ObjectId(query.companyId);
    if (query.tripId) filter.tripId = new Types.ObjectId(query.tripId);
    if (query.rating) filter.rating = query.rating;

    return this.reviewsRepository.findAllPublic(filter);
  }

  // ADMIN OPS
  async findAllForAdmin(query: ReviewQuery): Promise<any[]> {
    const filter: any = {};
    if (query.companyId) filter.companyId = new Types.ObjectId(query.companyId);

    return this.reviewsRepository.findAllWithDetails(filter);
  }

  async toggleVisibility(id: string, isVisible: boolean): Promise<any> {
    return this.reviewsRepository.update(id, { isVisible });
  }

  async remove(id: string): Promise<void> {
    await this.reviewsRepository.delete(id);
  }
}
