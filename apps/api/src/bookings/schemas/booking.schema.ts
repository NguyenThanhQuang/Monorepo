import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookingStatus, PaymentStatus } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';

// References
import { CompanyDefinition } from '@/companies/schemas/company.schema';
import { Trip } from '../../trips/schemas/trip.schema';
import { User } from '../../users/schemas/user.schema';

export type BookingDocument = HydratedDocument<Booking>;

// EMBEDDED SCHEMA: Thông tin hành khách (Snapshot tại thời điểm đặt)
@Schema({ _id: false })
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
export class Booking {
  // Liên kết người đặt (Optional - vì khách vãng lai cũng đặt được)
  @Prop({ type: Types.ObjectId, ref: User.name, index: true, required: false })
  userId?: Types.ObjectId;

  // Liên kết chuyến đi (Bắt buộc)
  @Prop({ type: Types.ObjectId, ref: Trip.name, required: true, index: true })
  tripId: Types.ObjectId;

  // Liên kết công ty (để tiện truy vấn doanh thu theo công ty)
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

  // --- TTL CONFIGURATION ---
  // Trường này xác định thời điểm vé giữ chỗ bị xóa tự động nếu chưa thanh toán
  @Prop({ type: Date, index: true })
  heldUntil?: Date;

  // PAYMENT INFO
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

  // CONTACT INFO
  @Prop({ type: String, required: true, trim: true })
  contactName: string;

  @Prop({ type: String, required: true, trim: true })
  contactPhone: string;

  @Prop({ type: String, trim: true, lowercase: true })
  contactEmail?: string;

  // TICKET & CODES
  @Prop({ type: String, unique: true, sparse: true, index: true })
  ticketCode?: string; // Chỉ sinh ra khi Confirm

  @Prop({ type: Number, unique: true, sparse: true, index: true })
  paymentOrderCode?: number; // Dùng cho Gateway

  @Prop({ type: String, index: true })
  paymentGatewayTransactionId?: string;

  // REFERENCE REVIEW
  @Prop({ type: Types.ObjectId, ref: 'Review', required: false, index: true })
  reviewId?: Types.ObjectId;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// SETUP TTL INDEX
// Chỉ xóa khi HELD và đã quá hạn heldUntil
BookingSchema.index(
  { heldUntil: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: BookingStatus.HELD },
  },
);

// Compound Index: Tìm vé theo SĐT User
BookingSchema.index({ contactPhone: 1, createdAt: -1 });
