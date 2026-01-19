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
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UrlBuilderService } from '../common/services/url-builder.service';
import { AuthService } from './auth.service';

// SCHEMAS (CONTRACT)
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
  ResetPasswordSchema,
} from '@obtp/validation';

// DTO INTERFACES
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationEmailPayload,
  ResetPasswordPayload,
} from '@obtp/shared-types';

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
    // Redirect logic using UrlBuilder
    try {
      const result = await this.authService.verifyEmail(token);
      const url = this.urlBuilderService.buildVerificationResultUrl(
        true,
        'EmailVerified',
        result.accessToken,
      );
      return res.redirect(url);
    } catch (error) {
      // Improve error mapping later
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
    await this.authService.register({ ...payload } as any); // Logic resend nằm trong register cũ, hoặc gọi hàm riêng nếu tách
    // Trong thiết kế mới ở service, nên tách ra: await this.authService.resendVerification(payload.email);
    // Giả sử service đã có hàm resend riêng
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
}
