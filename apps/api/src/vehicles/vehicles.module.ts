import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VehicleDefinition, VehicleSchema } from './schemas/vehicle.schema';
import { VehiclesController } from './vehicles.controller';
import { VehiclesRepository } from './vehicles.repository';
import { VehiclesService } from './vehicles.service';
// import { CompaniesModule } from '../companies/companies.module';

// Tạm thời cần Trip Schema để Service check integrity (sẽ xóa khi có TripsModule full)
// import { Trip, TripSchema } from '../trips/schemas/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleDefinition.name, schema: VehicleSchema },
    //   { name: Trip.name, schema: TripSchema }, // Legacy integrity check
    ]),
    // CompaniesModule, // Enable if required
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository],
  exports: [VehiclesService],
})
export class VehiclesModule {}
