import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';
import { ReviewDefinition, ReviewSchema } from './schemas/review.schema';

// DEPENDENCIES
import { BookingsModule } from '../bookings/bookings.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReviewDefinition.name, schema: ReviewSchema }]),
    ConfigModule,
    // Import để Service gọi validate logic
    forwardRef(() => BookingsModule),
    forwardRef(() => TripsModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}
