import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as sharedTypes from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';

export type VehicleDocument = HydratedDocument<VehicleDefinition>;

@Schema({ timestamps: true })
export class VehicleDefinition {
  @Prop({
    type: Types.ObjectId,
    ref: 'CompanyDefinition',
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, uppercase: true })
  vehicleNumber: string;

  @Prop({ type: String, required: true, trim: true })
  type: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({
    type: String,
    enum: Object.values(sharedTypes.VehicleStatus),
    default: sharedTypes.VehicleStatus.ACTIVE,
    index: true,
  })
  status: sharedTypes.VehicleStatus;

  @Prop({ type: Number, required: true, min: 1, default: 1 })
  floors: number;

  @Prop({ type: Number, required: true, min: 1 })
  seatColumns: number;

  @Prop({ type: Number, required: true, min: 1 })
  seatRows: number;

  @Prop({ type: [Number], required: true, default: [] })
  aislePositions: number[];

  @Prop({ type: Number, required: true, min: 1 })
  totalSeats: number;

  @Prop({ type: Object })
  seatMap?: sharedTypes.SeatMap;

  @Prop({ type: Object })
  seatMapFloor2?: sharedTypes.SeatMap;
}

export const VehicleSchema = SchemaFactory.createForClass(VehicleDefinition);

// Mỗi công ty không được có 2 xe trùng biển số
VehicleSchema.index({ companyId: 1, vehicleNumber: 1 }, { unique: true });
