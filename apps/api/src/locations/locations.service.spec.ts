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
import { LocationType } from '@obtp/shared-types';

jest.mock('@obtp/business-logic', () => ({
  generateLocationSlug: jest.fn((name: string) => `mocked-slug-${name}`),
  createSafeSearchRegex: jest.fn((keyword: string) => new RegExp(keyword, 'i')),
}));

import { LocationsRepository } from './locations.repository';
import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      findByNameAndProvince: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
      findPopular: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: LocationsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng thực thi: Tạo địa điểm (create)', () => {
    const payload = {
      name: 'Bến xe Mỹ Đình',
      province: 'Hà Nội',
      fullAddress: '20 Phạm Hùng',
      location: {
        type: 'Point' as const,
        coordinates: [105, 21] as [number, number],
      },
      type: LocationType.BUS_STATION,
    };

    it('Ném lỗi Conflict nếu địa điểm đã tồn tại (trùng Tên + Tỉnh)', async () => {
      repo.findByNameAndProvince.mockResolvedValue({ id: 'existed' });

      await expect(service.create(payload)).rejects.toThrow(ConflictException);
      expect(repo.findByNameAndProvince).toHaveBeenCalledWith(
        payload.name,
        payload.province,
      );
    });

    it('Thành công: Tự động sinh Slug và lưu xuống DB', async () => {
      repo.findByNameAndProvince.mockResolvedValue(null);
      repo.create.mockResolvedValue({
        id: 'new_id',
        ...payload,
        slug: 'mocked-slug-Bến xe Mỹ Đình',
      });

      const result = await service.create(payload);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...payload,
          slug: 'mocked-slug-Bến xe Mỹ Đình',
        }),
      );
      expect(result).toHaveProperty('id', 'new_id');
    });
  });

  describe('Tầng hiển thị: Tìm kiếm (search)', () => {
    it('Trả về mảng rỗng ngay lập tức nếu từ khóa trống', async () => {
      const result = await service.search('   ');
      expect(result).toEqual([]);
      expect(repo.search).not.toHaveBeenCalled();
    });

    it('Thành công: Chuẩn hóa từ khóa và gọi Repository', async () => {
      repo.search.mockResolvedValue([{ name: 'Hà Nội' }]);

      await service.search('Hà Nội');

      expect(repo.search).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ $regex: expect.any(RegExp) }),
            }),
          ]),
        }),
        15,
      );
    });
  });

  describe('Tầng nghiệp vụ: Cập nhật (update)', () => {
    const id = 'loc_123';

    it('Tự động sinh lại Slug mới nếu người dùng đổi tên địa điểm', async () => {
      repo.update.mockResolvedValue({
        id,
        name: 'Tên Mới',
        slug: 'mocked-slug-Tên Mới',
      });

      await service.update(id, { name: 'Tên Mới' });

      expect(repo.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          name: 'Tên Mới',
          slug: 'mocked-slug-Tên Mới',
        }),
      );
    });

    it('Không sinh lại Slug nếu không đổi tên', async () => {
      repo.update.mockResolvedValue({ id, address: 'Địa chỉ mới' });

      await service.update(id, { fullAddress: 'Địa chỉ mới' });

      expect(repo.update).toHaveBeenCalledWith(
        id,
        expect.not.objectContaining({ slug: expect.anything() }),
      );
    });

    it('Ném lỗi NotFound nếu ID không tồn tại', async () => {
      repo.update.mockResolvedValue(null);
      await expect(service.update(id, { name: 'A' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Tầng cơ sở: Xóa (remove)', () => {
    it('Ném lỗi NotFound nếu xóa không thành công', async () => {
      repo.delete.mockResolvedValue(null);
      await expect(service.remove('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Thành công', async () => {
      repo.delete.mockResolvedValue({ id: 'deleted' });
      await expect(service.remove('valid_id')).resolves.not.toThrow();
    });
  });
});
