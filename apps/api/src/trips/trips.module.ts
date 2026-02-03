import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesModule } from '../companies/companies.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripDefinition, TripSchema } from './schemas/trip.schema';
import { TripSchedulerService } from './trip.scheduler.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TripDefinition.name, schema: TripSchema }]),
    EventEmitterModule.forRoot(),
    forwardRef(() => VehiclesModule),
    CompaniesModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository, TripSchedulerService],
  exports: [TripsService],
})
export class TripsModule {}
