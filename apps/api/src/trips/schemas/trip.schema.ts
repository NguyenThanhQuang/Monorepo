import { LocationDefinition } from '@/locations/schemas/location.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SeatStatus, TripStatus, TripStopStatus } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';
import { CompanyDefinition } from '../../companies/schemas/company.schema';
import { VehicleDefinition } from '../../vehicles/schemas/vehicle.schema';

export type TripDocument = HydratedDocument<TripDefinition>;

// 1. SEAT SCHEMA (Embedded)
@Schema({ _id: false }) // Không cần _id riêng cho ghế để giảm tải
export class TripSeat {
  @Prop({ type: String, required: true })
  seatNumber: string;

  @Prop({
    type: String,
    enum: Object.values(SeatStatus),
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  // Nếu đã đặt, lưu Reference ID (nhưng lưu dưới dạng ObjectId để dễ populate nếu cần)
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: false })
  bookingId?: Types.ObjectId;
}
export const TripSeatSchema = SchemaFactory.createForClass(TripSeat);

// 2. STOP SCHEMA (Embedded)
@Schema({ _id: false })
export class TripStopInfo {
  @Prop({ type: Types.ObjectId, ref: LocationDefinition.name, required: true })
  locationId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  expectedArrivalTime: Date;

  @Prop({ type: Date })
  expectedDepartureTime?: Date;

  @Prop({
    type: String,
    enum: Object.values(TripStopStatus),
    default: TripStopStatus.PENDING,
  })
  status: TripStopStatus;
}
export const TripStopInfoSchema = SchemaFactory.createForClass(TripStopInfo);

// 3. ROUTE SCHEMA (Embedded)
@Schema({ _id: false })
export class RouteInfo {
  @Prop({
    type: Types.ObjectId,
    ref: LocationDefinition.name,
    required: true,
    index: true,
  })
  fromLocationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: LocationDefinition.name,
    required: true,
    index: true,
  })
  toLocationId: Types.ObjectId;

  @Prop({ type: [TripStopInfoSchema], default: [] })
  stops: TripStopInfo[];

  @Prop({ type: String }) // Google Polyline string
  polyline?: string;

  @Prop({ type: Number }) // Mét
  distance?: number;

  @Prop({ type: Number }) // Phút
  duration?: number;
}
export const RouteInfoSchema = SchemaFactory.createForClass(RouteInfo);

// 4. MAIN TRIP SCHEMA
@Schema({ timestamps: true })
export class TripDefinition {
  @Prop({
    type: Types.ObjectId,
    ref: CompanyDefinition.name,
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: VehicleDefinition.name,
    required: true,
    index: true,
  })
  vehicleId: Types.ObjectId;

  @Prop({ type: RouteInfoSchema, required: true })
  route: RouteInfo;

  @Prop({ type: Date, required: true, index: true })
  departureTime: Date;

  @Prop({ type: Date, required: true })
  expectedArrivalTime: Date;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({
    type: String,
    enum: Object.values(TripStatus),
    default: TripStatus.SCHEDULED,
    index: true,
  })
  status: TripStatus;

  @Prop({ type: [TripSeatSchema], required: true, default: [] })
  seats: TripSeat[];

  // Field này dùng để lưu tổng số ghế Available cache lại,
  // giúp truy vấn search "còn vé" nhanh hơn mà không cần scan mảng seats.
  // (Logic update field này sẽ nằm ở Service khi có booking)
  @Prop({ type: Number, default: 0, index: true })
  availableSeatsCount: number;

  // --- RECURRENCE (Logic lặp lịch) ---
  @Prop({ type: Boolean, default: false, index: true })
  isRecurrenceTemplate: boolean; // Nếu true, đây là Trip Mẫu

  @Prop({ type: Types.ObjectId, index: true })
  recurrenceParentId?: Types.ObjectId; // Nếu được sinh ra từ mẫu, link lại mẫu đó

  @Prop({ type: Boolean, default: true, index: true })
  isRecurrenceActive: boolean; // Bật/Tắt chế độ tự sinh từ mẫu này
}

export const TripSchema = SchemaFactory.createForClass(TripDefinition);

// COMPOUND INDEX: Tối ưu cho Search (Tìm chuyến từ A đến B sau ngày X)
TripSchema.index({
  'route.fromLocationId': 1,
  'route.toLocationId': 1,
  departureTime: 1,
  status: 1,
});
