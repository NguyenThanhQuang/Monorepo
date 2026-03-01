import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { ReviewDefinition, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(ReviewDefinition.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(doc: Partial<ReviewDefinition>): Promise<ReviewDocument> {
    const newReview = new this.reviewModel(doc);
    return newReview.save();
  }

  async findById(id: string | Types.ObjectId): Promise<ReviewDocument | null> {
    return this.reviewModel.findById(id).exec();
  }
  findByUserId(userId: Types.ObjectId) {
    return this.reviewModel
      .find({ userId })
      .populate('tripId')
      .populate('companyId')
      .sort({ createdAt: -1 })
      .lean();
  }
  async findOne(
    filter: QueryFilter<ReviewDocument>,
  ): Promise<ReviewDocument | null> {
    return this.reviewModel.findOne(filter).exec();
  }

  async existsByBookingId(
    bookingId: string | Types.ObjectId,
  ): Promise<boolean> {
    const exists = await this.reviewModel.exists({ bookingId });
    return !!exists;
  }

  async existsByBookingIdAndType(
    bookingId: string | Types.ObjectId,
    targetType: 'trip' | 'driver',
  ): Promise<boolean> {
    const exists = await this.reviewModel.exists({ bookingId, targetType });
    return !!exists;
  }

  async findAllPublic(
    filter: QueryFilter<ReviewDocument>,
  ): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find(filter)
      .select('-userId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllWithDetails(
    filter: QueryFilter<ReviewDocument>,
  ): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('companyId', 'name')
      .populate({
        path: 'tripId',
        select: 'route vehicleId departureTime',
        populate: [
          { path: 'route.fromLocationId', select: 'name' },
          { path: 'route.toLocationId', select: 'name' },
          { path: 'vehicleId', select: 'vehicleNumber' },
        ],
      })
      .populate('driverId', 'name phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findDriverReviews(
    driverId: Types.ObjectId,
    opts?: { limit?: number; skip?: number; includeHidden?: boolean },
  ) {
    const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 50);
    const skip = Math.max(opts?.skip ?? 0, 0);
    const filter: any = { targetType: 'driver', driverId };
    if (!opts?.includeHidden) filter.isVisible = true;

    return this.reviewModel
      .find(filter)
      .select('-userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getDriverRatingStats(driverId: Types.ObjectId, includeHidden = false) {
    const match: any = { targetType: 'driver', driverId };
    if (!includeHidden) match.isVisible = true;

    const [agg] = await this.reviewModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
            c1: {
              $sum: {
                $cond: [{ $eq: ['$rating', 1] }, 1, 0],
              },
            },
            c2: {
              $sum: {
                $cond: [{ $eq: ['$rating', 2] }, 1, 0],
              },
            },
            c3: {
              $sum: {
                $cond: [{ $eq: ['$rating', 3] }, 1, 0],
              },
            },
            c4: {
              $sum: {
                $cond: [{ $eq: ['$rating', 4] }, 1, 0],
              },
            },
            c5: {
              $sum: {
                $cond: [{ $eq: ['$rating', 5] }, 1, 0],
              },
            },
          },
        },
      ])
      .exec();

    return {
      avgRating: agg?.avgRating ? Number(agg.avgRating) : 0,
      count: agg?.count ?? 0,
      breakdown: {
        1: agg?.c1 ?? 0,
        2: agg?.c2 ?? 0,
        3: agg?.c3 ?? 0,
        4: agg?.c4 ?? 0,
        5: agg?.c5 ?? 0,
      },
    };
  }

  async save(review: ReviewDocument): Promise<ReviewDocument> {
    return review.save();
  }

  async update(
    id: string,
    updateData: UpdateQuery<ReviewDocument>,
  ): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).exec();
  }
}
