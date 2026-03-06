import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@obtp/shared-types';
import { Types } from 'mongoose';

jest.mock('@obtp/business-logic', () => ({
  hashPassword: async () => 'hashed_password',
  comparePassword: async (plain: string) => plain === 'correct_password',
  generateRandomToken: () => 'mocked_random_token',
  AUTH_CONSTANTS: {
    DEFAULTS: {
      EMAIL_VERIFICATION_EXPIRATION_MS: 86400000,
      PASSWORD_RESET_EXPIRATION_MS: 3600000,
    },
  },
}));

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let eventEmitter: any;
  let configService: any;
  let tokenService: any;

  // 2. SETUP MOCK DEPENDENCIES
  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn(),
      findOneByPhone: jest.fn(),
      create: jest.fn(),
      updateVerificationInfo: jest.fn(),
      updateLastLogin: jest.fn(),
      verifyEmailToken: jest.fn(),
      findOneByResetToken: jest.fn(),
      setResetToken: jest.fn(),
      resetPasswordWithToken: jest.fn(),
      sanitizeUser: jest.fn().mockImplementation((u: any) => u),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue(86400000), // Trả về số ms để tính toán Expiration
    };

    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('mocked_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: configService },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng nghiệp vụ: Đăng ký (register)', () => {
    const payload = {
      email: 'new@obtp.local',
      phone: '0901234567',
      password: 'plain_password',
      name: 'New User',
      confirmPassword: 'plain_password',
    };

    it('Ném lỗi Conflict nếu email đã tồn tại và đã xác thực', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        email: payload.email,
        isEmailVerified: true,
      });

      await expect(service.register(payload)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Ném lỗi Conflict nếu số điện thoại đã tồn tại', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.findOneByPhone.mockResolvedValue({
        _id: new Types.ObjectId(),
        phone: payload.phone,
      });

      await expect(service.register(payload)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Thành công: Tạo user mới và phát event đăng ký', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.findOneByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        email: payload.email,
        name: payload.name,
      });

      const result = await service.register(payload);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: payload.email,
          passwordHash: 'hashed_password', // Mock đã lo việc này
          roles: [UserRole.USER],
          emailVerificationToken: 'mocked_random_token',
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.any(Object),
      );
      expect(result.message).toBe(
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
      );
    });
  });

  describe('Tầng nghiệp vụ: Đăng nhập (login)', () => {
    const payload = {
      identifier: 'test@obtp.local',
      password: 'correct_password',
    };

    it('Ném lỗi Unauthorized nếu user không tồn tại', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.login(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Ném lỗi Unauthorized nếu sai mật khẩu', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        passwordHash: 'old_hash',
      });

      await expect(
        service.login({ ...payload, password: 'wrong_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Ném lỗi Unauthorized nếu tài khoản bị khóa (Banned)', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        passwordHash: 'old_hash',
        isBanned: true,
      });

      await expect(service.login(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Ném lỗi Unauthorized nếu chưa xác thực email (Unverified)', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        passwordHash: 'old_hash',
        isBanned: false,
        isEmailVerified: false,
      });

      await expect(service.login(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Thành công: Update Last Login và trả về Access Token', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        passwordHash: 'old_hash',
        isBanned: false,
        isEmailVerified: true,
      };
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.login(payload);

      expect(usersService.updateLastLogin).toHaveBeenCalledWith(
        mockUser._id.toString(),
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(result.accessToken).toBe('mocked_jwt_token');
    });
  });

  describe('Tầng nghiệp vụ: Gửi lại email xác thực (requestResendVerificationEmail)', () => {
    it('Bỏ qua âm thầm nếu email không tồn tại (Chống Scan User)', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      await service.requestResendVerificationEmail('notfound@obtp.local');

      // Không gọi hàm update
      expect(usersService.updateVerificationInfo).not.toHaveBeenCalled();
    });

    it('Ném lỗi BadRequest nếu user ĐÃ xác thực', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        isEmailVerified: true,
      });

      await expect(
        service.requestResendVerificationEmail('test@obtp.local'),
      ).rejects.toThrow(BadRequestException);
    });

    it('Thành công: Cập nhật token và phát event', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@obtp.local',
        name: 'Test',
        isEmailVerified: false,
      };
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      await service.requestResendVerificationEmail(mockUser.email);

      expect(usersService.updateVerificationInfo).toHaveBeenCalledWith(
        mockUser._id.toString(),
        expect.objectContaining({ token: 'mocked_random_token' }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.resend_verification',
        expect.any(Object),
      );
    });
  });
});
