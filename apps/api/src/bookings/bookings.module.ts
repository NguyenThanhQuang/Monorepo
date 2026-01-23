import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';

// DEPENDENCIES
import { TripsModule } from '../trips/trips.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ConfigModule,

    // Modules logic phụ thuộc
    forwardRef(() => TripsModule),
    UsersModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService], // Để Report module dùng
})
export class BookingsModule {}
