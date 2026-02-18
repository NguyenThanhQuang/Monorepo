// trips.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsModule } from 'src/bookings/bookings.module';
import { LocationsModule } from 'src/locations/locations.module';
import { CompaniesModule } from '../companies/companies.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripDefinition, TripSchema } from './schemas/trip.schema';
import { TripSchedulerService } from './trip.scheduler.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

// Import cả Definition và Schema
import { CompanyDefinition, CompanySchema } from '../companies/schemas/company.schema';
import { VehicleDefinition, VehicleSchema } from '../vehicles/schemas/vehicle.schema';
import { LocationDefinition, LocationSchema } from '../locations/schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TripDefinition.name, schema: TripSchema },
      // Đăng ký schema với tên mà populate sẽ dùng - DÙNG SCHEMA, KHÔNG PHẢI CLASS
      { name: 'Company', schema: CompanySchema }, // Dùng CompanySchema
      { name: 'Vehicle', schema: VehicleSchema }, // Dùng VehicleSchema
      { name: 'Location', schema: LocationSchema }, // Dùng LocationSchema
    ]),
    EventEmitterModule.forRoot(),
    forwardRef(() => VehiclesModule),
    forwardRef(() => CompaniesModule),
    forwardRef(() => BookingsModule),
    LocationsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository, TripSchedulerService],
  exports: [TripsService, TripsRepository],
})
export class TripsModule {}