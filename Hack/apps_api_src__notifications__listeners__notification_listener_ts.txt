import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as sharedTypes from '@obtp/shared-types';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('user.registered', { async: true })
  async handleUserRegisteredEvent(payload: sharedTypes.UserEventPayload) {
    this.logger.log(`>> EVENT: user.registered | Email: ${payload.email}`);
    await this.notificationsService.handleUserRegistered(payload);
  }

  @OnEvent('user.resend_verification', { async: true })
  async handleUserResendVerificationEvent(
    payload: sharedTypes.UserEventPayload,
  ) {
    this.logger.log(
      `>> EVENT: user.resend_verification | Email: ${payload.email}`,
    );
    await this.notificationsService.handleUserRegistered(payload);
  }

  @OnEvent('user.forgot_password', { async: true })
  async handleUserForgotPasswordEvent(payload: sharedTypes.UserEventPayload) {
    this.logger.log(`>> EVENT: user.forgot_password | Email: ${payload.email}`);
    await this.notificationsService.handleUserForgotPassword(payload);
  }

  // --- PENDING EVENTS (BOOKING) ---
  // TODO: Restore these listeners after Booking Module Refactor
  /*
  @OnEvent('booking.confirmed', { async: true })
  async handleBookingConfirmedEvent(booking: any) { ... }

  @OnEvent('booking.cancelled', { async: true })
  async handleBookingCancelledEvent(booking: any) { ... }
  */
}
