import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(PayOSWebhookSchema))
  async handleWebhook(@Body() payload: PayOSWebhookPayload) {
    await this.paymentsService.handleWebhook(payload);
    return { success: true };
  }
}
