import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { Trip, TripSchema } from './schemas/trip.schema';
import { TripSchedulerService } from './trip.scheduler.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

// MODULES IMPORT
import { CompaniesModule } from '../companies/companies.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
// LocationsModule, MapsModule...

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    EventEmitterModule.forRoot(), // Hoặc forRoot trong App Module gốc

    // Dependencies
    VehiclesModule,
    CompaniesModule,
    // LocationsModule...
  ],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository, TripSchedulerService],
  exports: [TripsService], // Export Service để BookingModule dùng
})
export class TripsModule {}
