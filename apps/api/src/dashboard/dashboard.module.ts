import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

import { Trip, TripSchema } from '../trips/schemas/trip.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CompanyDefinition, CompanySchema } from '@/companies/schemas/company.schema';

@Module({
  imports: [
    ConfigModule,
    // Import đủ Models cần cho việc Report
    MongooseModule.forFeature([
      { name: CompanyDefinition.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
