import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Global()
@Module({
  imports: [
    HttpModule, // Cung cấp HttpService để gọi OSRM
    ConfigModule,
  ],
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService], // Export để TripsModule dùng
})
export class MapsModule {}
