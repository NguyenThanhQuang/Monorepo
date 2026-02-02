import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AdminLoginLoggerMiddleware } from './middleware/admin-login-logger.middleware';
import { UrlBuilderService } from './services/url-builder.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    UrlBuilderService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [UrlBuilderService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminLoginLoggerMiddleware).forRoutes('*');
  }
}
