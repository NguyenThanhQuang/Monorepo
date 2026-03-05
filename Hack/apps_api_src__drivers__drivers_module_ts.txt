import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { BookingsModule } from '../bookings/bookings.module';
import { UsersModule } from '../users/users.module';
import {
  DriverProfileDefinition,
  DriverProfileSchema,
} from './schemas/driver-profile.schema';

@Module({
  imports: [
    BookingsModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: DriverProfileDefinition.name, schema: DriverProfileSchema },
    ]),
  ],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
