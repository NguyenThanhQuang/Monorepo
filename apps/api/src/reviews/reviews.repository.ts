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

  // Query cho Public (Client) - Ẩn bớt userId nếu cần hoặc populated nhẹ
  async findAllPublic(
    filter: QueryFilter<ReviewDocument>,
  ): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find(filter)
      .select('-userId') // Public view không cần biết ID cụ thể của user gốc nếu muốn bảo mật
      .sort({ createdAt: -1 })
      .exec();
  }

  // Query cho Admin (Full info)
  async findAllWithDetails(
    filter: QueryFilter<ReviewDocument>,
  ): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .exec();
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
