import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () =>
        this.http.pingCheck('internet_connectivity', 'https://google.com', {
          timeout: 5000,
        }),
    ]);
  }
}
