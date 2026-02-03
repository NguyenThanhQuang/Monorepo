import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BookingDefinition,
  BookingSchema,
} from '../bookings/schemas/booking.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

import {
  CompanyDefinition,
  CompanySchema,
} from '@/companies/schemas/company.schema';
import { TripDefinition, TripSchema } from '../trips/schemas/trip.schema';
import { UserDefinition, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CompanyDefinition.name, schema: CompanySchema },
      { name: UserDefinition.name, schema: UserSchema },
      { name: BookingDefinition.name, schema: BookingSchema },
      { name: TripDefinition.name, schema: TripSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
