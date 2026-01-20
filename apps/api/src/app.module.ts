import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- REFACTORED MODULES ---
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CompaniesModule } from './companies/companies.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';

// --- LEGACY/UNFINISHED MODULES (Restored later) ---
// TODO: Restore imports after refactoring these modules
// import { BookingsModule } from './bookings/bookings.module';
// import { DashboardModule } from './dashboard/dashboard.module';
// import { LocationsModule } from './locations/locations.module';
// import { MapsModule } from './maps/maps.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { PaymentsModule } from './payments/payments.module';
// import { ReviewsModule } from './reviews/reviews.module';
// import { TripsModule } from './trips/trips.module';
// import { VehiclesModule } from './vehicles/vehicles.module';
// import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 1. Core Infra
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // 2. Config & Validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // System
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        // Database
        // CHUẨN HÓA: Dùng key MONGODB_URI để khớp với AppModule các bước trước
        MONGODB_URI: Joi.string().required().description('URI kết nối MongoDB'),

        // Security
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().default('7d'),

        // Business Defaults
        SEAT_HOLD_DURATION_MINUTES: Joi.number().default(15),

        // Mail
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        MAIL_FROM_ADDRESS: Joi.string().required(),
        MAIL_FROM_NAME: Joi.string().default('OBTP System'),

        // Client
        API_BASE_URL: Joi.string().required(),
        CLIENT_URL: Joi.string().required(),

        // Optional Params for future
        // PAYOS_CLIENT_ID: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true, // Cho phép các key khác trong .env
        abortEarly: true,
      },
    }),

    // 3. Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME', 'obtp-system'),
        retryAttempts: 3,
      }),
      inject: [ConfigService],
    }),

    // 4. Global Core Logic (Chứa URL Builder, Interceptors, Filters)
    CommonModule,

    // 5. Active Features (Refactored)
    MailModule,
    AuthModule,
    UsersModule,
    CompaniesModule,

    // 6. Disabled Modules (Pending Refactor)
    // BookingsModule,
    // VehiclesModule,
    // TripsModule,
    // LocationsModule,
    // MapsModule,
    // NotificationsModule,
    // DashboardModule,
    // PaymentsModule,
    // ReviewsModule,
    // HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
