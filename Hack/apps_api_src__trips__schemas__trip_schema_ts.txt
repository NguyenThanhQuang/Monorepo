import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SeatStatus, TripStatus, TripStopStatus } from '@obtp/shared-types';
import { Document, Types } from 'mongoose';

export type TripDocument = TripDefinition & Document;

@Schema({ timestamps: true, collection: 'trips' })
export class TripDefinition {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({
    type: {
      fromLocationId: { type: Types.ObjectId, ref: 'Location', required: true },
      toLocationId: { type: Types.ObjectId, ref: 'Location', required: true },
      stops: [
        {
          locationId: { type: Types.ObjectId, ref: 'Location', required: true },
          expectedArrivalTime: { type: Date, required: true },
          expectedDepartureTime: Date,
          status: {
            type: String,
            enum: TripStopStatus,
            default: TripStopStatus.PENDING,
          },
        },
      ],
      duration: Number,
      distance: Number,
      polyline: String,
    },
    required: true,
  })
  route: {
    fromLocationId: Types.ObjectId;
    toLocationId: Types.ObjectId;
    stops: Array<{
      locationId: Types.ObjectId;
      expectedArrivalTime: Date;
      expectedDepartureTime?: Date;
      status: TripStopStatus;
    }>;
    duration?: number;
    distance?: number;
    polyline?: string;
  };

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  expectedArrivalTime: Date;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: String, enum: TripStatus, default: TripStatus.SCHEDULED })
  status: TripStatus;

  @Prop([
    {
      seatNumber: { type: String, required: true },
      status: { type: String, enum: SeatStatus, default: SeatStatus.AVAILABLE },
      floor: Number,
      bookingId: { type: Types.ObjectId, ref: 'Booking' },
      position: {
        row: Number,
        col: Number,
        x: Number,
        y: Number,
      },
    },
  ])
  seats: Array<{
    seatNumber: string;
    status: SeatStatus;
    floor?: number;
    bookingId?: Types.ObjectId;
    position?: { row: number; col: number; x?: number; y?: number };
  }>;

  @Prop({ default: 0 })
  availableSeatsCount: number;

  @Prop({ default: false })
  isRecurrenceTemplate: boolean;

  @Prop({ default: false })
  isRecurrenceActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Trip' })
  recurrenceParentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserDefinition' })
  driverId?: Types.ObjectId;
}

export const TripSchema = SchemaFactory.createForClass(TripDefinition);

TripSchema.index({ departureTime: 1, status: 1 });
TripSchema.index({ 'route.fromLocationId': 1, 'route.toLocationId': 1 });
TripSchema.index({ companyId: 1, departureTime: -1 });
TripSchema.index({ recurrenceParentId: 1 });

if (process.env.NODE_ENV !== 'production') {
  TripSchema.pre('find', function () {
    console.log('Mongoose Query:', this.getFilter());
  });

  TripSchema.pre('findOne', function () {
    console.log('Mongoose FindOne:', this.getFilter());
  });
}
