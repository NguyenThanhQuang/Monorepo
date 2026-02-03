import { Injectable, Logger } from '@nestjs/common';
import { UserEventPayload } from '@obtp/shared-types';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailService: MailService,
    // @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>, // TODO: Restore after Bookings Refactor
  ) {}

  // --- AUTH NOTIFICATIONS (ACTIVE) ---

 async handleUserRegistered(payload: UserEventPayload) {
    try {
      // SỬA: Truyền 3 tham số riêng biệt
      await this.mailService.sendVerificationEmail(
        payload.email,
        payload.name,
        payload.token
      );
      
      this.logger.log(
        `[Notification] Sent verification email to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${payload.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async handleUserForgotPassword(payload: UserEventPayload) {
    try {
      await this.mailService.sendPasswordResetEmail({
        email: payload.email,
        name: payload.name,
        token: payload.token,
      });
      this.logger.log(
        `[Notification] Sent password reset email to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${payload.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // --- BOOKING NOTIFICATIONS (DISABLED) ---

  // TODO: Restore methods below after Booking Module Refactor

  /*
  async handleBookingConfirmed(bookingPayload: any) { ... }
  async handleBookingCancelled(bookingPayload: any) { ... }
  */
}
