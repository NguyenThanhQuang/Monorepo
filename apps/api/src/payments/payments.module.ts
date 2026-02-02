import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import {
  PaymentTransaction,
  PaymentTransactionSchema,
} from './schemas/payment-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    ]),
    ConfigModule,

    // Payments gọi Bookings để confirm
    forwardRef(() => BookingsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
