import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationSettingsDocument = HydratedDocument<NotificationSettingsDefinition>;

@Schema({ timestamps: true, collection: 'notification_settings' })
export class NotificationSettingsDefinition {
  @Prop({ type: Types.ObjectId, ref: 'UserDefinition', unique: true, index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  marketing: boolean;

  @Prop({ type: Boolean, default: true })
  system: boolean;

  @Prop({ type: Boolean, default: true })
  booking: boolean;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettingsDefinition);
