import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DriveFileDocument = HydratedDocument<DriveFileDefinition>;

@Schema({ timestamps: true, collection: 'drive_files' })
export class DriveFileDefinition {
  @Prop({ type: Types.ObjectId, ref: 'UserDefinition', index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  originalName: string;

  @Prop({ type: String, required: true })
  mimeType: string;

  @Prop({ type: Number, required: true })
  size: number;

  @Prop({ type: String, required: true })
  storagePath: string;
}

export const DriveFileSchema = SchemaFactory.createForClass(DriveFileDefinition);
