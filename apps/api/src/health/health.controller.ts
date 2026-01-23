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
      // 1. Kiểm tra kết nối MongoDB
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // 2. Kiểm tra bộ nhớ Heap (Báo lỗi nếu vượt quá 300MB - Tùy chỉnh theo môi trường)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // 3. Kiểm tra kết nối Internet (Ping Google DNS)
      // Giúp phát hiện lỗi Server bị mất mạng, không gọi được External API (Maps, Payment)
      () =>
        this.http.pingCheck('internet_connectivity', 'https://google.com', {
          timeout: 5000,
        }),
    ]);
  }
}
