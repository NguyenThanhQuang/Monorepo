// src/trips/trip-scheduler.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { initializeTripSeats } from "@obtp/business-logic";
import { TripStatus, Vehicle } from "@obtp/shared-types";
import { Types } from "mongoose";
import { VehiclesService } from "../vehicles/vehicles.service";
import { TripsRepository } from "./trips.repository";

@Injectable()
export class TripSchedulerService {
  private readonly logger = new Logger(TripSchedulerService.name);

  // ✅ ENV flag để tắt scheduler trong dev/test
  // DISABLE_TRIP_SCHEDULER=true
  private readonly disabled =
    String(process.env.DISABLE_TRIP_SCHEDULER || "").toLowerCase() === "true";

  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private shouldRun(jobName: string): boolean {
    if (!this.disabled) return true;
    // log 1 dòng cho dễ hiểu
    this.logger.warn(`SKIP ${jobName}: DISABLE_TRIP_SCHEDULER=true`);
    return false;
  }

  // Tự động sinh chuyến đi hàng ngày (Daily Trip Gen)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyTripGeneration() {
    if (!this.shouldRun("DailyTripGeneration")) return;

    this.logger.log("Started Daily Trip Generation...");

    const templates = await this.tripsRepository.findActiveRecurrenceTemplates();
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
        bookingId: seat.bookingId ? new Types.ObjectId(seat.bookingId) : undefined,
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

    this.logger.log(`Generated ${count} trips for tomorrow.`);
  }

  // Update Status (SCHEDULED -> DEPARTED)
  // @Cron(CronExpression.EVERY_10_MINUTES)
  async handleUpdateDepartedTrips() {
    this.logger.log("SCAN: Updating DEPARTED trips...");
    const now = new Date();
    const result = await this.tripsRepository.updateManyStatus(
      {
        status: TripStatus.SCHEDULED,
        departureTime: { $lte: now },
      },
      TripStatus.DEPARTED,
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`UPDATED: ${result.modifiedCount} trips to DEPARTED.`);
    }
  }

  // @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUpdateArrivedTrips() {
    this.logger.log("SCAN: Updating ARRIVED trips...");
    const now = new Date();
    const result = await this.tripsRepository.updateManyStatus(
      {
        status: { $in: [TripStatus.DEPARTED, TripStatus.SCHEDULED] },
        expectedArrivalTime: { $lt: now },
      },
      TripStatus.ARRIVED,
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`UPDATED: ${result.modifiedCount} trips to ARRIVED.`);
    }
  }
}
