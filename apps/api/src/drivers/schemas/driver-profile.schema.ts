import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DriverProfileDocument = DriverProfileDefinition & Document;

export enum DriverProfileStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, collection: 'driver_profiles' })
export class DriverProfileDefinition {
  // ref = model name của user (UserDefinition.name)
  @Prop({ type: Types.ObjectId, ref: 'UserDefinition', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  licenseNumber: string;

  @Prop({ type: String, required: true, trim: true })
  idCardNumber: string;

  @Prop({ type: Number, default: 0 })
  experienceYears?: number;

  @Prop({ type: String, enum: Object.values(DriverProfileStatus), default: DriverProfileStatus.APPROVED, index: true })
  status: DriverProfileStatus;
}

export const DriverProfileSchema = SchemaFactory.createForClass(DriverProfileDefinition);
