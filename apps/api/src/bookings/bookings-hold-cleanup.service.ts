import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingsHoldCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingsHoldCleanupService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly bookingsRepo: BookingsRepository,
    private readonly bookingsService: BookingsService,
  ) {}

  onModuleInit() {
    const intervalMs = Number(this.config.get('BOOKING_HOLD_CLEANUP_INTERVAL_MS') ?? 30000);
    this.timer = setInterval(() => {
      this.tick().catch((e) =>
        this.logger.error('Hold cleanup tick failed', e instanceof Error ? e.stack : String(e)),
      );
    }, intervalMs);

    this.logger.log(`Hold cleanup started: every ${intervalMs}ms`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    const expired = await this.bookingsRepo.findExpiredHolds(new Date(), 200);
    if (!expired.length) return;

    this.logger.log(`Expired holds: ${expired.length} -> cancelling & releasing seats`);
    for (const b of expired) {
      try {
        await this.bookingsService.cancelExpiredHoldSystem(b._id.toString());
      } catch (e) {
        this.logger.warn(`Cancel expired hold failed: ${b._id} | ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
}