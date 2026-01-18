import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  // Sử dụng interface param chuẩn từ shared-types
  buildVerificationResultUrl(params: {
    success: boolean;
    messageKey: string;
    accessToken?: string;
  }): string {
    const { success, messageKey, accessToken } = params;
    const url = new URL(`${this.clientBaseUrl}${this.verificationResultPath}`);

    // Đảm bảo mapping đúng theo VerificationResultParams
    url.searchParams.set('success', String(success));
    url.searchParams.set('message', messageKey);

    if (success && accessToken) {
      url.searchParams.set('accessToken', accessToken);
    }
    return url.toString();
  }
}
