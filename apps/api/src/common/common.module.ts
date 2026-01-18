import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlBuilderService } from './utils/url-builder.service';
// Admin middleware can be registered here if needed

@Global()
@Module({
  imports: [ConfigModule],
  providers: [UrlBuilderService],
  exports: [UrlBuilderService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Implement middleware config if active
  }
}
