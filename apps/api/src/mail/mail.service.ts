import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateBookingSuccessEmail,
  generateCompanyAdminActivationEmail,
  generateCompanyAdminPromotionEmail,
  generatePasswordResetEmail,
  generateVerificationEmail,
} from '@obtp/business-logic';
import {
  BookingConfirmationEmailPayload,
  EmailContext,
  SendCompanyAdminActivationPayload,
  SendCompanyAdminPromotionPayload,
  SendForgotPasswordPayload,
  SendVerificationEmailPayload,
} from '@obtp/shared-types';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly mailFromName: string;
  private readonly mailFromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASSWORD');

    this.mailFromName = this.configService.get<string>(
      'MAIL_FROM_NAME',
      'OBTP System',
    );
    this.mailFromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') || '';

    if (!mailHost || !mailUser || !mailPass || !this.mailFromAddress) {
      this.logger.error('Mail Configuration is incomplete.');
      throw new InternalServerErrorException(
        'Mail Service improperly configured.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: { user: mailUser, pass: mailPass },
    });

    this.transporter.verify((err) => {
      if (err) this.logger.error('Mail transporter verification failed:', err);
      else this.logger.log('Mail transporter ready.');
    });
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.mailFromName}" <${this.mailFromAddress}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} | ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  async sendVerificationEmail(
    payload: SendVerificationEmailPayload,
  ): Promise<void> {
    const apiBaseUrl = this.configService.getOrThrow<string>('API_BASE_URL');
    const verifyTokenUrl = `${apiBaseUrl}/auth/verify-email-redirect?token=${payload.token}`;

    const context: EmailContext = {
      appName: this.mailFromName,
      verifyTokenUrl,
      expireText: this.configService.get(
        'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_TEXT',
        '24 giờ',
      ),
    };

    const { subject, html } = generateVerificationEmail(payload.name, context);
    await this.sendMail(payload.email, subject, html);
  }

  async sendPasswordResetEmail(
    payload: SendForgotPasswordPayload,
  ): Promise<void> {
    const apiBaseUrl = this.configService.getOrThrow<string>('API_BASE_URL');
    const resetUrl = `${apiBaseUrl}/auth/reset-password-redirect?token=${payload.token}`;

    const context: EmailContext = {
      appName: this.mailFromName,
      resetPasswordUrl: resetUrl,
      expireText: '1 giờ',
    };

    const { subject, html } = generatePasswordResetEmail(payload.name, context);
    await this.sendMail(payload.email, subject, html);
  }

  async sendBookingConfirmationEmail(
    payload: BookingConfirmationEmailPayload,
  ): Promise<void> {
    const { subject, html } = generateBookingSuccessEmail(
      payload,
      this.mailFromName,
    );
    await this.sendMail(payload.email, subject, html);
  }

  async sendCompanyAdminActivationEmail(
    payload: SendCompanyAdminActivationPayload,
  ): Promise<void> {
    // FIX: Sử dụng CLIENT_URL thay vì FRONTEND_URL để tránh bị undefined
    const clientUrl = this.configService.get(
      'CLIENT_URL',
      'http://localhost:5173',
    );
    const activationUrl = `${clientUrl}/activate-account?token=${payload.token}`;
    
    const context: EmailContext = {
      appName: this.mailFromName,
      verifyTokenUrl: activationUrl,
    };

    const { subject, html } = generateCompanyAdminActivationEmail(
      payload.name,
      context,
    );
    await this.sendMail(payload.email, subject, html);
  }

  async sendCompanyAdminPromotionEmail(
    payload: SendCompanyAdminPromotionPayload,
  ): Promise<void> {
    const clientUrl = this.configService.get(
      'CLIENT_URL',
      'http://localhost:5173',
    );

    const context: EmailContext = {
      appName: this.mailFromName,
      loginUrl: `${clientUrl}/login`,
    };

    const { subject, html } = generateCompanyAdminPromotionEmail(
      payload.name,
      payload.companyName,
      context,
    );
    await this.sendMail(payload.email, subject, html);
  }
}