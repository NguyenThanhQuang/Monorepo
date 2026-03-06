import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
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
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UrlBuilderService } from '../common/services/url-builder.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly urlBuilderService: UrlBuilderService,
    private readonly configService: ConfigService,
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

  /**
   * API verify email thật sự (verify xong redirect sang trang kết quả)
   * Nếu bạn muốn web/laptop luôn về 5176 thì ensure UrlBuilderService build ra đúng domain web.
   */
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const result = await this.authService.verifyEmail(token);
      const url = this.urlBuilderService.buildVerificationResultUrl(
        true,
        'EmailVerified',
        result.accessToken,
      );
      return res.redirect(302, url);
    } catch (error) {
      const url = this.urlBuilderService.buildVerificationResultUrl(
        false,
        'VerificationFailed',
      );
      return res.redirect(302, url);
    }
  }

  /**
   * ✅ Link trong email nên trỏ vào endpoint này
   * - Mobile: mở Expo Go vào VerifyEmailScreen
   * - Desktop: redirect về Web React (5176)
   */
  @Get('verify-email-redirect')
  async verifyEmailRedirect(
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!token) return res.status(400).send('Missing token');

    const expoHost =
      this.configService.get<string>('EXPO_HOST') ?? '192.168.1.14';
    const expoPort = this.configService.get<string>('EXPO_PORT') ?? '8081';
    const webBase =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:5173';

    const webUrl = `${webBase}/verify-email?token=${encodeURIComponent(token)}`;
    const expoUrl = `exp://${expoHost}:${expoPort}/--/verify-email?token=${encodeURIComponent(token)}`;

    // ✅ Android intent:// để tránh bị kẹt ở google.com/url (Gmail/Chrome)
    const expoPath = `//${expoHost}:${expoPort}/--/verify-email?token=${encodeURIComponent(token)}`;
    const androidIntentUrl = `intent:${expoPath}#Intent;scheme=exp;package=host.exp.exponent;end`;

    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const isMobile = /android|iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (!isMobile) return res.redirect(302, webUrl);

    const openUrl = isAndroid ? androidIntentUrl : expoUrl;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Verify Email</title>
</head>
<body style="font-family: system-ui; padding: 18px;">
  <h3>Đang mở ứng dụng để xác thực…</h3>

  <p style="opacity:.8; margin-top:8px;">
    Nếu app không tự mở, bấm nút bên dưới.
  </p>

  <p>
    <a href="${openUrl}"
      style="display:inline-block;padding:14px 18px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">
      Mở trong Expo Go
    </a>
  </p>

  <p style="margin-top:16px;">
    <a href="${webUrl}" style="font-weight:700;">Xác thực trên Web</a>
  </p>

  <p style="margin-top:14px;font-size:13px;opacity:.7;">
    Nếu mở từ Gmail mà không được: bấm <b>⋮</b> → <b>Mở trong trình duyệt</b>, rồi thử lại.
  </p>

  <script>
    (function () {
      var openUrl = ${JSON.stringify(openUrl)};
      var webUrl  = ${JSON.stringify(webUrl)};
      var start = Date.now();
      var FALLBACK_MS = 1200;

      // auto mở app
      window.location.replace(openUrl);

      // fallback về web nếu app không mở
      setTimeout(function () {
        if (Date.now() - start < FALLBACK_MS + 300) {
          window.location.replace(webUrl);
        }
      }, FALLBACK_MS);
    })();
  </script>
</body>
</html>
`);
  }

  @Get('verify-email-api')
  async verifyEmailApi(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Missing token');
    }

    try {
      const result = await this.authService.verifyEmail(token);

      return {
        ok: true,
        message: 'Xác thực email thành công.',
        accessToken: result.accessToken, // nếu bạn không cần thì có thể bỏ
      };
    } catch (error) {
      throw new BadRequestException('Xác thực thất bại');
    }
  }

  @Post('resend-verification-email')
  @UsePipes(new ZodValidationPipe(ResendVerificationSchema))
  async resendEmail(@Body() payload: ResendVerificationEmailPayload) {
    await this.authService.requestResendVerificationEmail(payload.email);
    return { message: 'Nếu email hợp lệ, mã xác thực mới đã được gửi đi.' };
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() payload: ForgotPasswordPayload) {
    await this.authService.requestPasswordReset(payload);
    return { message: 'Nếu email tồn tại, hướng dẫn reset sẽ được gửi đi.' };
  }

  @Get('validate-reset-token')
  async validateResetToken(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token không được cung cấp.');
    const result = await this.authService.validatePasswordResetToken(token);
    if (!result.isValid) {
      throw new BadRequestException(result.message || 'Token không hợp lệ.');
    }
    return result;
  }

  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() payload: ResetPasswordPayload) {
    await this.authService.resetPassword(payload);
    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  /**
   * ✅ Link reset-password trong email nên trỏ vào endpoint này
   * - Mobile: mở Expo Go vào ResetPasswordScreen
   * - Desktop: redirect về Web React (5176)
   */
  @Get('reset-password-redirect')
  async resetPasswordRedirect(
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!token) return res.status(400).send('Missing token');

    const expoHost =
      this.configService.get<string>('EXPO_HOST') ?? '192.168.1.14';
    const expoPort = this.configService.get<string>('EXPO_PORT') ?? '8081';
    const webBase =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:5173';

    const webUrl = `${webBase}/reset-password?token=${encodeURIComponent(token)}`;

    const expoUrl = `exp://${expoHost}:${expoPort}/--/reset-password?token=${encodeURIComponent(token)}`;

    // ✅ Android: intent:// mở chắc hơn, tránh bị kẹt ở google.com/url
    const expoPath = `//${expoHost}:${expoPort}/--/reset-password?token=${encodeURIComponent(token)}`;
    const androidIntentUrl = `intent:${expoPath}#Intent;scheme=exp;package=host.exp.exponent;end`;

    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const isMobile = /android|iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (!isMobile) return res.redirect(302, webUrl);

    const openUrl = isAndroid ? androidIntentUrl : expoUrl;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Reset Password</title>
</head>
<body style="font-family: system-ui; padding: 18px;">
  <h3>Đang mở ứng dụng để đặt lại mật khẩu…</h3>

  <p style="opacity:.8; margin-top:8px;">
    Nếu app không tự mở, bấm nút bên dưới.
  </p>

  <p>
    <a href="${openUrl}"
      style="display:inline-block;padding:14px 18px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">
      Mở trong Expo Go
    </a>
  </p>

  <p style="margin-top:12px;font-size:13px;opacity:.75;">
    Nếu vẫn không mở được: bấm <b>⋮</b> → <b>Mở trong trình duyệt</b>, rồi thử lại.
  </p>

  <p style="margin-top:14px;">
    <a href="${webUrl}" style="font-weight:700;">Reset trên Web</a>
  </p>

  <script>
    (function () {
      var openUrl = ${JSON.stringify(openUrl)};
      var webUrl  = ${JSON.stringify(webUrl)};
      var start = Date.now();
      var FALLBACK_MS = 1200;

      // auto mở app
      window.location.replace(openUrl);

      // fallback về web nếu app không mở
      setTimeout(function () {
        if (Date.now() - start < FALLBACK_MS + 300) {
          window.location.replace(webUrl);
        }
      }, FALLBACK_MS);
    })();
  </script>
</body>
</html>
  `);
  }

  @Get('validate-activation-token')
  async validateActivationToken(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token không được cung cấp.');
    const result = await this.authService.validateActivationToken(token);
    if (!result.isValid) {
      throw new BadRequestException(result.message || 'Token không hợp lệ.');
    }
    return result;
  }

 @Post('activate-account')
  async activateAccount(@Body() payload: ActivateAccountPayload) {
    if (!payload.token || !payload.newPassword) {
      throw new BadRequestException('Thiếu token hoặc mật khẩu.');
    }

    return this.authService.activateAccount(payload);
  }
}
