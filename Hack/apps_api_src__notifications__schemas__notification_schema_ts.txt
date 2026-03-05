import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<NotificationDefinition>;

@Schema({ timestamps: true, collection: 'notifications' })
export class NotificationDefinition {
  @Prop({ type: Types.ObjectId, ref: 'UserDefinition', index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, trim: true, required: true })
  title: string;

  @Prop({ type: String, trim: true })
  message?: string;

  @Prop({ type: String, trim: true, default: 'general' })
  type?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;

  @Prop({ type: Object })
  data?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationDefinition);
