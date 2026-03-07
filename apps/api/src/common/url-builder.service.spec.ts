/// <reference types="jest" />

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

const mockConstructUrl = jest.fn();

jest.mock('@obtp/business-logic', () => ({
  constructVerificationUrl: (...args: any[]) => mockConstructUrl(...args),
}));

import { UrlBuilderService } from '../common/services/url-builder.service';

describe('UrlBuilderService', () => {
  let service: UrlBuilderService;
  let configService: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string, defaultValue: any) => {
        if (key === 'CLIENT_URL') return 'https://client.obtp.com';
        if (key === 'CLIENT_VERIFICATION_RESULT_PATH') return '/verify-result';
        return defaultValue;
      }),
    };

    mockConstructUrl.mockReturnValue('https://mocked-result-url.com');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlBuilderService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<UrlBuilderService>(UrlBuilderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildVerificationResultUrl', () => {
    it('Trường hợp thành công: Phải truyền đúng token và cờ success=true vào hàm logic', () => {
      const result = service.buildVerificationResultUrl(
        true,
        'EmailVerified',
        'sample_token',
      );

      expect(result).toBe('https://mocked-result-url.com');

      expect(mockConstructUrl).toHaveBeenCalledWith(
        'https://client.obtp.com',
        '/verify-result',
        true,
        'EmailVerified',
        'sample_token',
      );
    });

    it('Trường hợp thất bại: Phải truyền cờ success=false và không có token', () => {
      service.buildVerificationResultUrl(false, 'VerificationFailed');

      expect(mockConstructUrl).toHaveBeenCalledWith(
        'https://client.obtp.com',
        '/verify-result',
        false,
        'VerificationFailed',
        undefined,
      );
    });
  });
});
