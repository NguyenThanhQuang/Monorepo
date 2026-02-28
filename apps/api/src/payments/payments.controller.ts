import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type {
  AuthUserResponse,
  CreatePaymentLinkPayload,
  PayOSWebhookPayload,
} from '@obtp/shared-types';

import { CreatePaymentLinkSchema, PayOSWebhookSchema } from '@obtp/validation';

import { PaymentsService } from './payments.service';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-link')
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreatePaymentLinkSchema))
  async createPaymentLink(
    @Body() payload: CreatePaymentLinkPayload,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.paymentsService.createPaymentLink(payload, user);
  }

    @Post('sync')
  @UseGuards(JwtAuthGuard) // giống create-link (nếu create-link của bạn đang guard)
  async syncPayment(@Body() body: { bookingId: string }, @Req() req: Request) {
    const user = (req as any).user; // JwtAuthGuard sẽ attach user vào req.user
    return this.paymentsService.syncPaymentByBookingId(body.bookingId, user);
  }

    // ✅ DEV confirm: không cần PayOS trả PAID
  @Post('dev-confirm')
  @UseGuards(JwtAuthGuard)
  async devConfirm(@Body() body: { bookingId: string }, @Req() req: Request) {
    const user = (req as any).user;
    return this.paymentsService.devConfirmPayment(body.bookingId, user);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(PayOSWebhookSchema))
  async handleWebhook(@Body() payload: PayOSWebhookPayload) {
    await this.paymentsService.handleWebhook(payload);
    return { success: true };
  }
}
