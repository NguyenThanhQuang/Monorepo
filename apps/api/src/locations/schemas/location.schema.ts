import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as sharedTypes from '@obtp/shared-types';
import { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<LocationDefinition>;

@Schema({
  collection: 'locations',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class LocationDefinition implements Omit<sharedTypes.Location, 'id'> {
  @Prop({ type: String, required: true, trim: true, index: 'text' })
  name: string;

  @Prop({ type: String, trim: true, unique: true, sparse: true })
  slug: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  province: string;

  @Prop({ type: String, trim: true })
  district?: string;

  @Prop({ type: String, required: true, trim: true })
  fullAddress: string;

  // Cấu trúc Raw của Mongoose cho GeoJSON
  @Prop(
    raw({
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    }),
  )
  location: sharedTypes.GeoJsonPoint;

  @Prop({ type: String, enum: sharedTypes.LocationType, required: true })
  type: sharedTypes.LocationType;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(LocationDefinition);

// INDEX BẮT BUỘC CHO GEO SEARCH
LocationSchema.index({ location: '2dsphere' });
LocationSchema.index({ province: 1, name: 1 });
