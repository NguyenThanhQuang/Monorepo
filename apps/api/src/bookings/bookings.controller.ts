import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';

import {
  ConfirmBookingSchema,
  CreateBookingSchema,
  LookupBookingSchema,
  UpdateBookingCustomerSchema,
} from '@obtp/validation';

import { BookingsService } from './bookings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

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
    return this.bookingsService.confirmBooking(id, payload);
  }

  // bookings.controller.ts
  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompanyBookings(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    console.log('GET /bookings/company - User:', {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
    });

    try {
      const bookings = await this.bookingsService.getBookingsByCompany(user);
      console.log('Returning bookings:', bookings?.length || 0);

      // Trả về trực tiếp, interceptor sẽ wrap thành { statusCode, message, data }
      return bookings;
    } catch (error) {
      console.error('Controller error:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.bookingsService.getBookingById(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.bookingsService.cancelBooking(id, user);
  }

  @Post('lookup')
  @UsePipes(new ZodValidationPipe(LookupBookingSchema))
  async lookup(@Body() payload: sharedTypes.LookupBookingPayload) {
    return this.bookingsService.lookup(payload);
  }

  @Patch(':id/customer-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateBookingCustomerSchema))
  async updateCustomerInfo(
    @Param('id') id: string,
    @Body() payload: sharedTypes.UpdateBookingCustomerPayload,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.bookingsService.updateCustomerInfo(id, payload, user);
  }
}
