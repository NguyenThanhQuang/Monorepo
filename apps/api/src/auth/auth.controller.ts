import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type {
  ActivateAccountPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationEmailPayload,
  ResetPasswordPayload,
} from '@obtp/shared-types';
import {
  ActivateAccountSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
  ResetPasswordSchema,
} from '@obtp/validation';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UrlBuilderService } from '../common/services/url-builder.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly urlBuilderService: UrlBuilderService,
  ) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const result = await this.authService.verifyEmail(token);
      const url = this.urlBuilderService.buildVerificationResultUrl(
        true,
        'EmailVerified',
        result.accessToken,
      );
      return res.redirect(url);
    } catch (error) {
      const url = this.urlBuilderService.buildVerificationResultUrl(
        false,
        'VerificationFailed',
      );
      return res.redirect(url);
    }
  }

  @Post('resend-verification-email')
  @UsePipes(new ZodValidationPipe(ResendVerificationSchema))
  async resendEmail(@Body() payload: ResendVerificationEmailPayload) {
    await this.authService.register({ ...payload } as any);
    return { message: 'Yêu cầu gửi lại đã được tiếp nhận.' };
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() payload: ForgotPasswordPayload) {
    await this.authService.requestPasswordReset(payload);
    return { message: 'Nếu email tồn tại, hướng dẫn reset sẽ được gửi đi.' };
  }

  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() payload: ResetPasswordPayload) {
    await this.authService.resetPassword(payload);
    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  @Post('activate-account')
  @UsePipes(new ZodValidationPipe(ActivateAccountSchema))
  async activateAccount(@Body() payload: ActivateAccountPayload) {
    return this.authService.activateAccount(payload);
  }
}
