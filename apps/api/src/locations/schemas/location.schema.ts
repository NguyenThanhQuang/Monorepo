import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LocationType } from '@obtp/shared-types';

@Schema({
  timestamps: true, 
})
export class LocationEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  slug?: string;

  @Prop({ required: true })
  province: string;

  @Prop()
  district?: string;

  @Prop({ required: true })
  fullAddress: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ enum: LocationType })
  type: LocationType;

  @Prop({ default: [] })
  images?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  createdAt: string;
  
  @Prop({ default: true })
  updatedAt: string;
}

export type LocationDocument = HydratedDocument<LocationEntity>;
export const LocationSchema = SchemaFactory.createForClass(LocationEntity);
