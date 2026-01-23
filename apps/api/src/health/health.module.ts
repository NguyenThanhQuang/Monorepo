import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule, // Cung cấp HealthCheckService
    HttpModule, // Cung cấp HttpHealthIndicator
  ],
  controllers: [HealthController],
})
export class HealthModule {}
