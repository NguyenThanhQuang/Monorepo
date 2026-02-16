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

  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly vehiclesService: VehiclesService,
  ) {}

  // Tự động sinh chuyến đi hàng ngày (Daily Trip Gen)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyTripGeneration() {
    this.logger.log('Started Daily Trip Generation...');

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
        template.vehicleId._id.toString(),
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
        seats: seats,
        availableSeatsCount: seats.length,
      });
      count++;
    }
    this.logger.log(`Generated ${count} trips for tomorrow.`);
  }

  // Update Status (SCHEDULED -> DEPARTED)
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleStatusUpdate() {
    // Vì Repository Mongoose support updateMany
    // Ta có thể inject TripModel vào đây hoặc thêm method updateStatus vào Repo
    // Ở đây demo concept, ta giả định Repo có updateManyStatus
    // await this.tripsRepository.updateManyStatus(...)
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleUpdateDepartedTrips() {
    this.logger.log('SCAN: Updating DEPARTED trips...');
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

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUpdateArrivedTrips() {
    this.logger.log('SCAN: Updating ARRIVED trips...');
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
