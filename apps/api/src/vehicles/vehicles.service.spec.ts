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
import { VehicleStatus } from '@obtp/shared-types';
import { Types } from 'mongoose';

jest.mock('@obtp/business-logic', () => ({
  calculateVehicleConfig: () => ({
    totalSeats: 40,
    seatMapFloor1: { layout: [['A01', 'A02']] },
    seatMapFloor2: null,
  }),
}));

import { TripsService } from '../trips/trips.service';
import { VehiclesRepository } from './vehicles.repository';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehiclesRepository: any;
  let tripsService: any;

  beforeEach(async () => {
    vehiclesRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      checkDuplicateNumber: jest.fn(),
      update: jest.fn(),
    };

    tripsService = {
      checkVehicleHasActiveTrips: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: VehiclesRepository, useValue: vehiclesRepository },
        { provide: TripsService, useValue: tripsService },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng thực thi: Khởi tạo xe (create)', () => {
    it('Tạo xe thành công, tự động gọi logic tính toán sơ đồ ghế', async () => {
      const payload = {
        companyId: new Types.ObjectId().toString(),
        vehicleNumber: '29A-12345',
        type: 'Limousine',
        floors: 1,
        seatRows: 10,
        seatColumns: 4,
      };

      vehiclesRepository.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        ...payload,
      } as any);

      await service.create(payload as any);

      expect(vehiclesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleNumber: '29A-12345',
          totalSeats: 40,
          seatMap: expect.anything(),
        }),
      );
    });
  });

  describe('Tầng hiển thị: Danh sách xe (findAll)', () => {
    it('Bổ sung cờ hasActiveTrips cho mỗi xe trong danh sách', async () => {
      const vehicleId = new Types.ObjectId();
      const validCompanyId = new Types.ObjectId().toString(); // ✅ FIX: Tạo ID hợp lệ

      const mockVehicles = [
        { _id: vehicleId, toObject: () => ({ vehicleNumber: '30B-99999' }) },
      ];

      vehiclesRepository.findAll.mockResolvedValue(mockVehicles);
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(true);

      const result = await service.findAll(validCompanyId);

      expect(vehiclesRepository.findAll).toHaveBeenCalled();
      expect(tripsService.checkVehicleHasActiveTrips).toHaveBeenCalledWith(
        vehicleId.toString(),
      );

      expect(result[0]).toEqual({
        vehicleNumber: '30B-99999',
        hasActiveTrips: true,
      });
    });
  });

  describe('Tầng nghiệp vụ: Cập nhật xe (update)', () => {
    const vehicleId = new Types.ObjectId().toString();
    const companyIdObj = new Types.ObjectId();
    const existingVehicle = {
      _id: vehicleId,
      companyId: companyIdObj,
      vehicleNumber: '29A-12345',
      status: VehicleStatus.ACTIVE,
      seatRows: 10,
      seatColumns: 4,
      floors: 1,
      aislePositions: [2],
      fullRows: [10],
    };

    beforeEach(() => {
      vehiclesRepository.findById.mockResolvedValue(existingVehicle);
    });

    it('Ném lỗi NotFound nếu không tìm thấy xe', async () => {
      vehiclesRepository.findById.mockResolvedValue(null);
      await expect(service.update(vehicleId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Ném lỗi Conflict nếu đổi biển số sang một biển đã tồn tại của xe khác', async () => {
      vehiclesRepository.checkDuplicateNumber.mockResolvedValue(true);

      await expect(
        service.update(vehicleId, { vehicleNumber: '30B-99999' } as any),
      ).rejects.toThrow(ConflictException);

      expect(vehiclesRepository.checkDuplicateNumber).toHaveBeenCalledWith(
        companyIdObj,
        '30B-99999',
        vehicleId,
      );
    });

    it('Ném lỗi Conflict nếu đổi trạng thái xe (Bảo trì) khi xe đang chạy chuyến đi', async () => {
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(true);

      await expect(
        service.update(vehicleId, { status: VehicleStatus.MAINTENANCE } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('Ném lỗi Conflict nếu sửa cấu trúc ghế (Số hàng, tầng) khi xe đang chạy chuyến đi', async () => {
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(true);

      await expect(
        service.update(vehicleId, { seatRows: 12 } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('Thành công: Cập nhật cấu trúc ghế (Tự động tính lại Map) nếu xe đang rảnh', async () => {
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(false);
      vehiclesRepository.update.mockResolvedValue({
        ...existingVehicle,
        seatRows: 12,
      });

      await service.update(vehicleId, { seatRows: 12 } as any);

      expect(vehiclesRepository.update).toHaveBeenCalledWith(
        vehicleId,
        expect.objectContaining({
          seatRows: 12,
          totalSeats: 40,
        }),
      );
    });
  });

  describe('Tầng nghiệp vụ: Xóa / Vô hiệu hóa xe (remove)', () => {
    const vehicleId = new Types.ObjectId().toString();

    it('Ném lỗi Conflict nếu xe đang có chuyến đi chưa hoàn thành', async () => {
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(true);

      await expect(service.remove(vehicleId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Thành công: Chuyển trạng thái xe thành INACTIVE thay vì xóa cứng (Soft Delete)', async () => {
      tripsService.checkVehicleHasActiveTrips.mockResolvedValue(false);
      vehiclesRepository.update.mockResolvedValue({
        id: vehicleId,
        status: VehicleStatus.INACTIVE,
      });

      await service.remove(vehicleId);

      expect(vehiclesRepository.update).toHaveBeenCalledWith(vehicleId, {
        status: VehicleStatus.INACTIVE,
      });
    });
  });
});
