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
  // @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyTripGeneration() {
    if (!this.shouldRun('DailyTripGeneration')) return;

    this.logger.log('>>> [JOB] Bắt đầu sinh chuyến đi tự động cho ngày mai...');

    const templates =
      await this.tripsRepository.findActiveRecurrenceTemplates();
    let successCount = 0;
    let failCount = 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const template of templates) {
      try {
        const tDate = new Date(template.departureTime);
        const nextDeparture = new Date(tomorrow);
        nextDeparture.setHours(tDate.getHours(), tDate.getMinutes(), 0, 0);

        const exists = await this.tripsRepository.findDailyTrip(
          template._id.toString(),
          nextDeparture,
        );

        if (exists) continue;

        const safeVehicleId =
          (template.vehicleId as any)?._id?.toString() ||
          template.vehicleId.toString();
        const safeCompanyId =
          (template.companyId as any)?._id?.toString() ||
          template.companyId.toString();

        const vehicle = await this.vehiclesService.findOne(safeVehicleId);

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
          companyId: safeCompanyId,
          vehicleId: safeVehicleId,
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

        successCount++;
      } catch (error) {
        this.logger.error(`Lỗi khi tạo chuyến mẫu ${template._id}:`, error);
        failCount++;
      }
    }

    this.logger.log(
      `<<<[JOB] Hoàn tất. Đã tạo: ${successCount} | Lỗi: ${failCount}`,
    );
  }

  /**
   * 2. Tự động chuyển trạng thái: ĐÃ LÊN LỊCH -> ĐANG CHẠY (SCHEDULED -> DEPARTED)
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleUpdateDepartedTrips() {
    if (!this.shouldRun('UpdateDepartedTrips')) return;

    const now = new Date();
    const result = await this.tripsRepository.updateManyStatus(
      {
        status: TripStatus.SCHEDULED,
        departureTime: { $lte: now },
        isRecurrenceTemplate: false,
      },
      TripStatus.DEPARTED,
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `[STATUS] Đã chuyển ${result.modifiedCount} chuyến sang ĐANG CHẠY.`,
      );
    }
  }

  /**
   * 3. Tự động chuyển trạng thái: ĐANG CHẠY -> HOÀN THÀNH (DEPARTED -> ARRIVED)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUpdateArrivedTrips() {
    if (!this.shouldRun('UpdateArrivedTrips')) return;

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
        `[STATUS] Đã chuyển ${result.modifiedCount} chuyến sang HOÀN THÀNH.`,
      );
    }
  }
}
