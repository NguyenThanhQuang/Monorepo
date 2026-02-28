import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsModule } from 'src/bookings/bookings.module';
import { LocationsModule } from 'src/locations/locations.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompanySchema } from '../companies/schemas/company.schema';
import { LocationSchema } from '../locations/schemas/location.schema';
import { VehicleSchema } from '../vehicles/schemas/vehicle.schema';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripDefinition, TripSchema } from './schemas/trip.schema';
import { TripSchedulerService } from './trip.scheduler.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TripDefinition.name, schema: TripSchema },
      { name: 'Company', schema: CompanySchema },
      { name: 'Vehicle', schema: VehicleSchema },
      { name: 'Location', schema: LocationSchema },
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
