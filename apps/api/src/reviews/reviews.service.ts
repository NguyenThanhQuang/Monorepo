import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthUserResponse,
  CreateGuestReviewPayload,
  CreateReviewPayload,
  isPopulated,
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
import { ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly tripsService: TripsService,
    private readonly configService: ConfigService,
  ) {}

  private async validateAndGetResources(bookingId: string, tripId: string) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');

    if (booking.tripId.toString() !== tripId) {
      throw new BadRequestException(
        'Thông tin booking và chuyến đi không khớp.',
      );
    }

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
    return this.reviewsRepository.findByUserId(new Types.ObjectId(userId));
  }
  async create(
    payload: CreateReviewPayload,
    user: AuthUserResponse,
  ): Promise<ReviewDocument> {
    const { booking, trip } = await this.validateAndGetResources(
      payload.bookingId,
      payload.tripId,
    );

    if (!booking.userId || booking.userId.toString() !== user.id) {
      throw new ForbiddenException(
        'Booking này không thuộc tài khoản của bạn.',
      );
    }
    let companyIdToSave: Types.ObjectId;
    if (isPopulated(trip.companyId)) {
      companyIdToSave = new Types.ObjectId(trip.companyId._id);
    } else {
      companyIdToSave = new Types.ObjectId(trip.companyId.toString());
    }

    const review = await this.reviewsRepository.create({
      userId: new Types.ObjectId(user.id),
      bookingId: new Types.ObjectId(payload.bookingId),
      tripId: new Types.ObjectId(payload.tripId),
      companyId: companyIdToSave,

      rating: payload.rating,
      comment: payload.comment,
      isAnonymous: !!payload.isAnonymous,

      displayName: payload.isAnonymous
        ? `${user.name.charAt(0).toUpperCase()}***`
        : user.name,
    });

    booking.reviewId = review._id;
    await this.bookingsRepository.save(booking);

    return review;
  }

  async createAsGuest(
    payload: CreateGuestReviewPayload,
  ): Promise<ReviewDocument> {
    const { booking, trip } = await this.validateAndGetResources(
      payload.bookingId,
      payload.tripId,
    );

    if (booking.contactPhone !== payload.contactPhone) {
      throw new ForbiddenException(
        'Số điện thoại xác thực không khớp với đơn đặt vé.',
      );
    }

    let companyIdToSave: Types.ObjectId;
    if (isPopulated(trip.companyId)) {
      companyIdToSave = new Types.ObjectId(trip.companyId._id);
    } else {
      companyIdToSave = new Types.ObjectId(trip.companyId.toString());
    }

    const review = await this.reviewsRepository.create({
      bookingId: new Types.ObjectId(payload.bookingId),
      tripId: new Types.ObjectId(payload.tripId),
      companyId: companyIdToSave,

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
  ): Promise<ReviewDocument> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');

    if (!review.userId || review.userId.toString() !== user.id) {
      throw new ForbiddenException('Không có quyền chỉnh sửa.');
    }

    if (review.editCount > 0) {
      throw new ForbiddenException('Chỉ được phép chỉnh sửa đánh giá 1 lần.');
    }

    const windowDays = this.configService.get<number>(
      'REVIEW_EDIT_WINDOW_DAYS',
      BUSINESS_CONSTANTS.REVIEW.EDIT_WINDOW_DAYS,
    );
    const isExpired = dayjs().diff(dayjs(review.createdAt), 'day') > windowDays;

    if (isExpired)
      throw new ForbiddenException(
        `Quá thời hạn chỉnh sửa (${windowDays} ngày).`,
      );

    if (payload.rating) review.rating = payload.rating;
    if (payload.comment !== undefined) review.comment = payload.comment;

    review.editCount += 1;
    review.lastEditedAt = new Date();

    return this.reviewsRepository.save(review);
  }

  async findAllPublic(query: ReviewQuery): Promise<ReviewDocument[]> {
    const filter: any = { isVisible: true };

    if (query.companyId) filter.companyId = new Types.ObjectId(query.companyId);
    if (query.tripId) filter.tripId = new Types.ObjectId(query.tripId);
    if (query.rating) filter.rating = query.rating;

    return this.reviewsRepository.findAllPublic(filter);
  }

  async findAllForAdmin(query: ReviewQuery): Promise<ReviewDocument[]> {
    const filter: any = {};
    if (query.companyId) filter.companyId = new Types.ObjectId(query.companyId);

    return this.reviewsRepository.findAllWithDetails(filter);
  }

  async toggleVisibility(
    id: string,
    isVisible: boolean,
  ): Promise<ReviewDocument | null> {
    return this.reviewsRepository.update(id, { isVisible });
  }

  async remove(id: string): Promise<void> {
    await this.reviewsRepository.delete(id);
  }
}
