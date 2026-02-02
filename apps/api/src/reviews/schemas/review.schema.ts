import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<ReviewDefinition>;

@Schema({ timestamps: true })
export class ReviewDefinition {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: false })
  userId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true, index: true })
  tripId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
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

ReviewSchema.index({ companyId: 1, createdAt: -1 }); // Lấy review mới nhất của nhà xe
ReviewSchema.index({ tripId: 1, createdAt: -1 }); // Lấy review của chuyến đi
