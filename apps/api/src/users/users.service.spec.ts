import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@obtp/shared-types';
import { Types } from 'mongoose';

jest.mock('@obtp/business-logic', () => ({
  hashPassword: async () => 'hashed_password',
  comparePassword: async (plain: string) => plain === 'correct_password',
  generateRandomToken: () => 'mocked_random_token',
  sanitizeUser: (user: any) => ({
    id: user._id?.toString() || 'mocked_id',
    email: user.email,
    name: user.name,
    phone: user.phone,
    roles: user.roles || [],
    isBanned: !!user.isBanned,
  }),
  AUTH_CONSTANTS: {
    DEFAULTS: { EMAIL_VERIFICATION_EXPIRATION_MS: 86400000 },
  },
}));

import { BookingsRepository } from '../bookings/bookings.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: any;
  let bookingsRepository: any;

  beforeEach(async () => {
    usersRepository = {
      findById: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findOneByEmailWithPassword: jest.fn(),
      findOneByPhoneWithPassword: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    bookingsRepository = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: BookingsRepository, useValue: bookingsRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng cơ sở: Tìm kiếm User', () => {
    it('findById: Trả về null nếu ID không phải MongoId hợp lệ', async () => {
      const result = await service.findById('invalid_id');
      expect(result).toBeNull();
      expect(usersRepository.findById).not.toHaveBeenCalled();
    });

    it('findById: Gọi repository nếu ID hợp lệ', async () => {
      const validId = new Types.ObjectId().toString();
      const mockUser = { _id: validId, email: 'test@obtp.local' };
      usersRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.findById(validId);
      expect(usersRepository.findById).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('Tầng thực thi: Khởi tạo User', () => {
    it('create: Phải băm mật khẩu và lưu với role mặc định nếu không truyền role', async () => {
      const payload = {
        email: 'new@obtp.local',
        phone: '0901234567',
        password: 'plain_password',
        name: 'New User',
      };

      usersRepository.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        ...payload,
      } as any);

      await service.create(payload);

      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: payload.email,
          passwordHash: 'hashed_password',
          roles: [UserRole.USER],
          isEmailVerified: false,
        }),
      );
    });
  });

  describe('Tầng nghiệp vụ: Đổi mật khẩu (changePassword)', () => {
    const userId = new Types.ObjectId().toString();

    it('Ném lỗi NotFound nếu user không tồn tại', async () => {
      usersRepository.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, {
          currentPassword: 'any',
          newPassword: 'new',
          confirmNewPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Ném lỗi BadRequest nếu mật khẩu hiện tại sai', async () => {
      usersRepository.findByIdWithPassword.mockResolvedValue({
        _id: userId,
        passwordHash: 'old_hash',
      } as any);

      await expect(
        service.changePassword(userId, {
          currentPassword: 'wrong_password',
          newPassword: 'new',
          confirmNewPassword: 'new',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Thành công: Băm mật khẩu mới và lưu lại', async () => {
      const mockUser = { _id: userId, passwordHash: 'old_hash' };
      usersRepository.findByIdWithPassword.mockResolvedValue(mockUser as any);
      usersRepository.save.mockResolvedValue(mockUser as any);

      const result = await service.changePassword(userId, {
        currentPassword: 'correct_password',
        newPassword: 'new_strong_password',
        confirmNewPassword: 'new_strong_password',
      });

      expect(mockUser.passwordHash).toBe('hashed_password');
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'Đổi mật khẩu thành công.' });
    });
  });

  describe('Tầng nghiệp vụ: Admin / Quản lý nhà xe (createOrPromoteCompanyAdmin)', () => {
    const payload = {
      name: 'Admin Xe',
      email: 'admin@nhaxe.local',
      phone: '0999999999',
      companyId: new Types.ObjectId().toString(),
    };

    it('Thăng cấp (Promote): Nếu user đã tồn tại, thêm role COMPANY_ADMIN và update companyId', async () => {
      const existingUser = {
        _id: new Types.ObjectId(),
        email: payload.email,
        roles: [UserRole.USER],
        companyId: null,
      };

      usersRepository.findOne.mockResolvedValue(existingUser as any);
      usersRepository.save.mockResolvedValue(existingUser as any);

      const { user, isNew } =
        await service.createOrPromoteCompanyAdmin(payload);

      expect(isNew).toBe(false);
      expect(user.roles).toContain(UserRole.COMPANY_ADMIN);
      expect(user.companyId).toEqual(new Types.ObjectId(payload.companyId));
      expect(usersRepository.save).toHaveBeenCalledWith(existingUser);
    });

    it('Tạo mới (Create): Nếu user chưa tồn tại, tạo account với Activation Token', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        email: payload.email,
        roles: [UserRole.COMPANY_ADMIN],
      } as any);

      const { user, isNew } =
        await service.createOrPromoteCompanyAdmin(payload);

      expect(isNew).toBe(true);
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: payload.email,
          roles: [UserRole.COMPANY_ADMIN],
          accountActivationToken: 'mocked_random_token',
          isEmailVerified: false,
        }),
      );
    });
  });
});
