import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';

import {
  ConfirmBookingSchema,
  CreateBookingSchema,
  LookupBookingSchema,
} from '@obtp/validation';

import { BookingsService } from './bookings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('hold')
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateBookingSchema))
  async createHold(
    @Body() payload: sharedTypes.CreateBookingPayload,
    @CurrentUser() user?: sharedTypes.AuthUserResponse,
  ) {
    return this.bookingsService.createHold(payload, user);
  }

  @Post('confirm/:id')
  @UsePipes(new ZodValidationPipe(ConfirmBookingSchema))
  async manualConfirm(
    @Param('id') id: string,
    @Body() payload: sharedTypes.ConfirmBookingPayload,
  ) {
    // Endpoint này nên protected by Admin Guard hoặc dùng Internal API key cho Payment Gateway Callback
    return this.bookingsService.confirmBooking(id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string, @CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.bookingsService.cancelBooking(id, user);
  }

  @Post('lookup')
  @UsePipes(new ZodValidationPipe(LookupBookingSchema))
  async lookup(@Body() payload: sharedTypes.LookupBookingPayload) {
    return this.bookingsService.lookup(payload);
  }
}
