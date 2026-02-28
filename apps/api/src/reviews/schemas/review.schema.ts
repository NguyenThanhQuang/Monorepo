import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<ReviewDefinition>;

export type ReviewTargetType = 'trip' | 'driver';

@Schema({ timestamps: true, collection: 'reviews' })
export class ReviewDefinition {
  @Prop({
    type: String,
    enum: ['trip', 'driver'],
    default: 'trip',
    index: true,
  })
  targetType: ReviewTargetType;

  // ✅ driverId chỉ dùng khi targetType='driver'
  @Prop({
    type: Types.ObjectId,
    ref: 'UserDefinition',
    required: false,
    index: true,
  })
  driverId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserDefinition',
    index: true,
    required: false,
  })
  userId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'TripDefinition',
    required: true,
    index: true,
  })
  tripId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CompanyDefinition',
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  // ⚠️ Không unique đơn lẻ nữa, để 1 booking có thể có review trip + review driver
  @Prop({
    type: Types.ObjectId,
    ref: 'BookingDefinition',
    required: true,
    index: true,
  })
  bookingId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, max: 5, index: true })
  rating: number;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  comment?: string;

  @Prop({ type: Boolean, default: false })
  isAnonymous: boolean;

  @Prop({ type: Number, default: 0 })
  editCount: number;

  @Prop({ type: Date })
  lastEditedAt?: Date;

  @Prop({ type: Boolean, default: true, index: true })
  isVisible: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
export const ReviewSchema = SchemaFactory.createForClass(ReviewDefinition);

// ✅ mỗi booking chỉ được 1 review cho mỗi targetType
ReviewSchema.index({ bookingId: 1, targetType: 1 }, { unique: true });

ReviewSchema.index({ companyId: 1, createdAt: -1 }); // review mới nhất của nhà xe
ReviewSchema.index({ tripId: 1, createdAt: -1 }); // review của chuyến đi
ReviewSchema.index({ driverId: 1, createdAt: -1 }); // review của tài xế
