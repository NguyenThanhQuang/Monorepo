import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  
console.log('MONGODB_URI =', process.env.MONGODB_URI);
console.log('Mongo connected host =', mongoose.connection.host);
console.log('Mongo connected db   =', mongoose.connection.name);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const clientUrl = configService.get<string>('CLIENT_URL', '*');
  app.enableCors({
    origin: (origin, callback) => {
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

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Server đang chạy tại: http://localhost:${port}/api/v1`);
}
bootstrap();
