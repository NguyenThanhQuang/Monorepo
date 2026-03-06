/// <reference types="jest" />

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CompaniesRepository } from './companies.repository';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companiesRepo: any;
  let usersService: any;
  let mailService: any;

  beforeEach(async () => {
    companiesRepo = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCompanyStats: jest.fn(),
    };

    usersService = {
      createOrPromoteCompanyAdmin: jest.fn(),
      findOneByEmail: jest.fn(),
      findOneByPhone: jest.fn(),
    };

    mailService = {
      sendCompanyAdminActivationEmail: jest.fn(),
      sendCompanyAdminPromotionEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: CompaniesRepository, useValue: companiesRepo },
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng nghiệp vụ: Tạo Nhà Xe (create)', () => {
    const payload = {
      name: 'Nhà Xe OBTP',
      code: 'OBTP',
      adminName: 'Admin',
      adminEmail: 'admin@obtp.local',
      adminPhone: '0999999999',
    };

    it('Ném lỗi Conflict nếu tên nhà xe đã tồn tại', async () => {
      companiesRepo.findOne.mockResolvedValueOnce({ id: 'existing_id' });

      await expect(service.create(payload)).rejects.toThrow(ConflictException);
      expect(companiesRepo.findOne).toHaveBeenCalledWith({
        name: payload.name,
      });
    });

    it('Ném lỗi Conflict nếu mã (code) nhà xe đã tồn tại', async () => {
      companiesRepo.findOne.mockResolvedValueOnce(null);
      companiesRepo.findOne.mockResolvedValueOnce({ id: 'existing_id' });

      await expect(service.create(payload)).rejects.toThrow(ConflictException);
    });

    it('Thành công (User Mới): Tạo nhà xe, tạo admin, gửi email kích hoạt', async () => {
      companiesRepo.findOne.mockResolvedValue(null);

      const newCompany = {
        id: new Types.ObjectId().toString(),
        name: payload.name,
      };
      companiesRepo.create.mockResolvedValue(newCompany);

      const mockAdminUser = {
        email: payload.adminEmail,
        name: payload.adminName,
        accountActivationToken: 'valid_token',
      };

      usersService.createOrPromoteCompanyAdmin.mockResolvedValue({
        user: mockAdminUser,
        isNew: true,
      });

      const result = await service.create(payload);

      expect(result).toEqual(newCompany);
      expect(mailService.sendCompanyAdminActivationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'valid_token' }),
      );
    });

    it('Rollback: Xóa nhà xe nếu việc tạo Admin hoặc gửi Mail thất bại', async () => {
      companiesRepo.findOne.mockResolvedValue(null);

      const newCompanyId = new Types.ObjectId().toString();
      companiesRepo.create.mockResolvedValue({
        id: newCompanyId,
        name: payload.name,
      });
      companiesRepo.delete.mockResolvedValue(true);

      usersService.createOrPromoteCompanyAdmin.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.create(payload)).rejects.toThrow('DB Error');

      expect(companiesRepo.delete).toHaveBeenCalledWith(newCompanyId);
    });
  });

  describe('Tầng nghiệp vụ: Cập nhật Nhà Xe (update)', () => {
    const companyId = new Types.ObjectId().toString();
    const existingCompany = {
      id: companyId,
      name: 'Old Name',
      code: 'OLD',
      email: 'old@obtp.local',
      phone: '0900000000',
    };

    beforeEach(() => {
      companiesRepo.findById.mockResolvedValue(existingCompany);
      companiesRepo.update.mockResolvedValue({
        ...existingCompany,
        name: 'New Name',
      });
    });

    it('Cross-collection check: Ném lỗi nếu Email cập nhật đã bị User khác sử dụng', async () => {
      companiesRepo.findOne.mockResolvedValue(null);

      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      await expect(
        service.update(companyId, { email: 'user_used@obtp.local' }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'user_used@obtp.local',
      );
    });

    it('Cross-collection check: Ném lỗi nếu Phone cập nhật đã bị User khác sử dụng', async () => {
      companiesRepo.findOne.mockResolvedValue(null);
      usersService.findOneByPhone.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      await expect(
        service.update(companyId, { phone: '0911111111' }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.findOneByPhone).toHaveBeenCalledWith('0911111111');
    });

    it('Thành công: Cập nhật hợp lệ', async () => {
      companiesRepo.findOne.mockResolvedValue(null);
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.findOneByPhone.mockResolvedValue(null);

      const result = await service.update(companyId, {
        name: 'New Name',
        phone: '0922222222',
      });

      expect(companiesRepo.update).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({ name: 'New Name', phone: '0922222222' }),
      );
      expect(result.name).toBe('New Name');
    });
  });

  describe('Tầng cơ sở: Tìm kiếm và Xóa', () => {
    const companyId = new Types.ObjectId().toString();

    it('findOne: Ném lỗi NotFound nếu không tìm thấy', async () => {
      companiesRepo.findById.mockResolvedValue(null);
      await expect(service.findOne(companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('remove: Ném lỗi NotFound nếu không tìm thấy', async () => {
      companiesRepo.findById.mockResolvedValue(null);
      await expect(service.remove(companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('remove: Thành công', async () => {
      companiesRepo.findById.mockResolvedValue({ id: companyId });
      companiesRepo.delete.mockResolvedValue(true);

      await service.remove(companyId);
      expect(companiesRepo.delete).toHaveBeenCalledWith(companyId);
    });
  });
});
