import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Company, CompanyStatus } from '@obtp/shared-types';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<CompanyDefinition>;

@Schema({
  collection: 'companies',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class CompanyDefinition implements Omit<Company, 'id'> {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  code: string;

  @Prop({ type: String, trim: true })
  address?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, trim: true, lowercase: true })
  email?: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String, trim: true })
  logoUrl?: string;

  @Prop({
    type: String,
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
    index: true,
  })
  status: CompanyStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyDefinition);
