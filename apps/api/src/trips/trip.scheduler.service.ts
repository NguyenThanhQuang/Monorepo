import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { initializeTripSeats } from '@obtp/business-logic';
import { TripStatus, Vehicle } from '@obtp/shared-types';
import { Types } from 'mongoose';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TripsRepository } from './trips.repository';

@Injectable()
export class TripSchedulerService {
  private readonly logger = new Logger(TripSchedulerService.name);

  private readonly disabled =
    String(process.env.DISABLE_TRIP_SCHEDULER || '').toLowerCase() === 'true';

  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private shouldRun(jobName: string): boolean {
    if (!this.disabled) return true;
    this.logger.warn(`[SKIP] ${jobName}: DISABLE_TRIP_SCHEDULER is enabled.`);
    return false;
  }

  /**
   * 1. Tự động sinh chuyến đi từ Template cho ngày mai
   * Chạy vào lúc 01:00 AM hàng ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyTripGeneration() {
    if (!this.shouldRun('DailyTripGeneration')) return;

    this.logger.log('>>> [JOB] Bắt đầu sinh chuyến đi tự động cho ngày mai...');

    const templates =
      await this.tripsRepository.findActiveRecurrenceTemplates();
    let count = 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const template of templates) {
      const tDate = new Date(template.departureTime);
      const nextDeparture = new Date(tomorrow);
      nextDeparture.setHours(tDate.getHours(), tDate.getMinutes(), 0, 0);

      const exists = await this.tripsRepository.findDailyTrip(
        template._id.toString(),
        nextDeparture,
      );

      if (exists) continue;

      const vehicle = await this.vehiclesService.findOne(
        template.vehicleId.toString(),
      );

      const vehicleParam: Partial<Vehicle> = {
        ...vehicle.toObject(),
        _id: vehicle._id.toString(),
      } as unknown as Partial<Vehicle>;

      const rawSeats = initializeTripSeats(vehicleParam);
      const seats = rawSeats.map((seat) => ({
        ...seat,
        bookingId: seat.bookingId
          ? new Types.ObjectId(seat.bookingId)
          : undefined,
      }));

      const durationMs =
        new Date(template.expectedArrivalTime).getTime() - tDate.getTime();
      const nextArrival = new Date(nextDeparture.getTime() + durationMs);

      await this.tripsRepository.create({
        companyId: template.companyId,
        vehicleId: template.vehicleId,
        route: template.route,
        price: template.price,
        departureTime: nextDeparture,
        expectedArrivalTime: nextArrival,
        isRecurrenceTemplate: false,
        isRecurrenceActive: false,
        recurrenceParentId: template._id as any,
        status: TripStatus.SCHEDULED,
        seats,
        availableSeatsCount: seats.length,
      });

      count++;
    }

    this.logger.log(`<<< [JOB] Hoàn tất. Đã tạo ${count} chuyến đi.`);
  }

  /**
   * 2. Tự động chuyển trạng thái: ĐÃ LÊN LỊCH -> ĐANG CHẠY (SCHEDULED -> DEPARTED)
   * Chạy mỗi 10 phút
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleUpdateDepartedTrips() {
    if (!this.shouldRun('UpdateDepartedTrips')) return;

    this.logger.log('[SCAN] Kiểm tra các chuyến đi đến giờ khởi hành...');
    const now = new Date();

    const result = await this.tripsRepository.updateManyStatus(
      {
        status: TripStatus.SCHEDULED,
        departureTime: { $lte: now },
        isRecurrenceTemplate: false, // Không tác động vào chuyến mẫu
      },
      TripStatus.DEPARTED,
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `[SUCCESS] Đã chuyển ${result.modifiedCount} chuyến sang trạng thái ĐANG CHẠY.`,
      );
    }
  }

  /**
   * 3. Tự động chuyển trạng thái: ĐANG CHẠY -> HOÀN THÀNH (DEPARTED -> ARRIVED)
   * Chạy mỗi 30 phút
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUpdateArrivedTrips() {
    if (!this.shouldRun('UpdateArrivedTrips')) return;

    this.logger.log('[SCAN] Kiểm tra các chuyến đi đã kết thúc hành trình...');
    const now = new Date();

    const result = await this.tripsRepository.updateManyStatus(
      {
        status: { $in: [TripStatus.DEPARTED, TripStatus.SCHEDULED] },
        expectedArrivalTime: { $lt: now },
        isRecurrenceTemplate: false,
      },
      TripStatus.ARRIVED,
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `[SUCCESS] Đã chuyển ${result.modifiedCount} chuyến sang trạng thái HOÀN THÀNH.`,
      );
    }
  }
}
