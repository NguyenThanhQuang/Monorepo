import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { constructVerificationUrl } from '@obtp/business-logic';

@Injectable()
export class UrlBuilderService {
  private readonly clientBaseUrl: string;
  private readonly verificationResultPath: string;

  constructor(private readonly configService: ConfigService) {
    this.clientBaseUrl = this.configService.get<string>(
      'CLIENT_URL',
      'http://localhost:5173',
    );
    this.verificationResultPath = this.configService.get<string>(
      'CLIENT_VERIFICATION_RESULT_PATH',
      '/auth/verification-result',
    );
  }

  buildVerificationResultUrl(
    success: boolean,
    messageKey: string,
    accessToken?: string,
  ): string {
    return constructVerificationUrl(
      this.clientBaseUrl,
      this.verificationResultPath,
      success,
      messageKey,
      accessToken,
    );
  }
}
