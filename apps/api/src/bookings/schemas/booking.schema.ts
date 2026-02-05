import { CompanyDefinition } from '@/companies/schemas/company.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookingStatus, PaymentStatus } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';
import { TripDefinition } from '../../trips/schemas/trip.schema';
import { UserDefinition } from '../../users/schemas/user.schema';

export type BookingDocument = HydratedDocument<BookingDefinition>;

@Schema({
  collection: 'bookings',
})
export class PassengerInfo {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  phone: string;

  @Prop({ type: String, required: true })
  seatNumber: string;

  @Prop({ type: Number, required: true })
  price: number;
}
export const PassengerInfoSchema = SchemaFactory.createForClass(PassengerInfo);

@Schema({ timestamps: true })
export class BookingDefinition {
  @Prop({
    type: Types.ObjectId,
    ref: UserDefinition.name,
    index: true,
    required: false,
  })
  userId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: TripDefinition.name,
    required: true,
    index: true,
  })
  tripId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CompanyDefinition.name,
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, required: true })
  bookingTime: Date;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
    index: true,
  })
  status: BookingStatus;

  @Prop({ type: Date, index: true })
  heldUntil?: Date;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({ type: String })
  paymentMethod?: string;

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: [PassengerInfoSchema], required: true, default: [] })
  passengers: PassengerInfo[];

  @Prop({ type: String, required: true, trim: true })
  contactName: string;

  @Prop({ type: String, required: true, trim: true })
  contactPhone: string;

  @Prop({ type: String, trim: true, lowercase: true })
  contactEmail?: string;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  ticketCode?: string;

  @Prop({ type: Number, unique: true, sparse: true, index: true })
  paymentOrderCode?: number;

  @Prop({ type: String, index: true })
  paymentGatewayTransactionId?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'ReviewDefinition',
    required: false,
    index: true,
  })
  reviewId?: Types.ObjectId;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDefinition);

// Chỉ xóa khi HELD và đã quá hạn heldUntil
BookingSchema.index(
  { heldUntil: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: BookingStatus.HELD },
  },
);

BookingSchema.index({ contactPhone: 1, createdAt: -1 });
