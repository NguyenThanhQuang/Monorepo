import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Không cần import tay Filters/Pipes/Interceptors vì CommonModule đã tự apply Global

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 1. Prefix: api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 2. CORS Config
  const clientUrl = configService.get<string>('CLIENT_URL', '*');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow Requests with no origin (like mobile apps or curl calls)
      if (!origin) return callback(null, true);

      if (
        clientUrl === '*' ||
        origin === clientUrl ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // NOTE: Ta không dùng app.useGlobalPipes(new ValidationPipe({...})) nữa
  // Vì các Module mới sử dụng ZodValidationPipe cục bộ cho từng Controller.
  // Điều này giúp tránh conflict validate legacy DTO.

  // 3. Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Server đang chạy tại: http://localhost:${port}/api/v1`);
}
bootstrap();
