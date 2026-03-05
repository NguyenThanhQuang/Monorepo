import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
