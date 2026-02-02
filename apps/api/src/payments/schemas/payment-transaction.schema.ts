import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethod, PaymentStatus } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentTransactionDocument = HydratedDocument<PaymentTransaction>;

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ type: Number, required: true, unique: true, index: true })
  orderCode: number;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  bookingId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true, default: PaymentMethod.PAYOS })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  status: PaymentStatus;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  transactionDateTime?: string;

  @Prop({ type: String })
  accountNumber?: string;

  @Prop({ type: Object })
  rawWebhookData?: Record<string, any>;
}

export const PaymentTransactionSchema =
  SchemaFactory.createForClass(PaymentTransaction);
