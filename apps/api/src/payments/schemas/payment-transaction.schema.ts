import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethod, PaymentStatus } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentTransactionDocument = HydratedDocument<PaymentTransaction>;

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ type: Number, required: true, unique: true, index: true })
  orderCode: number; // PayOS int64 order code

  @Prop({ type: Types.ObjectId, required: true, index: true })
  bookingId: Types.ObjectId; // Link thủ công (không ref cứng để tránh lỗi query khi booking xóa)

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

  // Audit Logs
  @Prop({ type: String })
  description?: string;

  @Prop({ type: String }) // Transaction date from gateway
  transactionDateTime?: string;

  @Prop({ type: String }) // Account info mask
  accountNumber?: string;

  @Prop({ type: Object }) // Lưu full webhook data để debug
  rawWebhookData?: Record<string, any>;
}

export const PaymentTransactionSchema =
  SchemaFactory.createForClass(PaymentTransaction);
