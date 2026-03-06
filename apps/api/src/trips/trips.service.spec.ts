/// <reference types="jest" />

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyStatus,
  SeatStatus,
  TripStatus,
  VehicleStatus,
} from '@obtp/shared-types';
import { Types } from 'mongoose';

jest.mock('@obtp/business-logic', () => ({
  initializeTripSeats: () => [
    { seatNumber: 'A01', status: SeatStatus.AVAILABLE },
    { seatNumber: 'A02', status: SeatStatus.AVAILABLE },
  ],
}));

import { BookingsRepository } from '../../src/bookings/bookings.repository';
import { LocationsRepository } from '../../src/locations/locations.repository';
import { MapsService } from '../../src/maps/maps.service';
import { CompaniesService } from '../companies/companies.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

describe('TripsService', () => {
  let service: TripsService;
  let tripsRepository: any;
  let vehiclesService: any;
  let companiesService: any;
  let mapsService: any;
  let locationsRepo: any;
  let bookingsRepo: any;
  let eventEmitter: any;

  beforeEach(async () => {
    tripsRepository = {
      create: jest.fn(),
      findByIdWithDetails: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    vehiclesService = {
      findOne: jest.fn(),
    };

    companiesService = {
      findOne: jest.fn(),
    };

    mapsService = {
      getRouteInfo: jest.fn(),
    };

    locationsRepo = {};
    bookingsRepo = {};

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: TripsRepository, useValue: tripsRepository },
        { provide: VehiclesService, useValue: vehiclesService },
        { provide: CompaniesService, useValue: companiesService },
        { provide: MapsService, useValue: mapsService },
        { provide: LocationsRepository, useValue: locationsRepo },
        { provide: BookingsRepository, useValue: bookingsRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tầng thực thi: Khởi tạo chuyến đi (create)', () => {
    const payload = {
      companyId: new Types.ObjectId().toString(),
      vehicleId: new Types.ObjectId().toString(),
      route: {
        fromLocationId: new Types.ObjectId().toString(),
        toLocationId: new Types.ObjectId().toString(),
        stops: [],
      },
      departureTime: new Date(Date.now() + 86400000).toISOString(),
      expectedArrivalTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      price: 500000,
    };

    it('Ném lỗi BadRequest nếu Nhà xe đang ngừng hoạt động', async () => {
      companiesService.findOne.mockResolvedValue({
        status: CompanyStatus.INACTIVE,
      });
      vehiclesService.findOne.mockResolvedValue({
        status: VehicleStatus.ACTIVE,
      });

      await expect(service.create(payload as any)).rejects.toThrow(
        'Nhà xe đang ngừng hoạt động.',
      );
    });

    it('Ném lỗi BadRequest nếu Phương tiện đang bảo trì/không khả dụng', async () => {
      companiesService.findOne.mockResolvedValue({ status: 'active' });
      vehiclesService.findOne.mockResolvedValue({
        status: VehicleStatus.MAINTENANCE,
        vehicleNumber: '29A',
      });

      await expect(service.create(payload as any)).rejects.toThrow(
        'Xe 29A không khả dụng.',
      );
    });

    it('Ném lỗi BadRequest nếu Phương tiện KHÔNG thuộc về Nhà xe yêu cầu (Cross-company hacking)', async () => {
      companiesService.findOne.mockResolvedValue({
        status: 'active',
        _id: payload.companyId,
      });
      vehiclesService.findOne.mockResolvedValue({
        status: VehicleStatus.ACTIVE,
        companyId: new Types.ObjectId().toString(),
      });

      await expect(service.create(payload as any)).rejects.toThrow(
        /Xe không thuộc về nhà xe này/,
      );
    });

    it('Thành công: Khởi tạo ghế trống và lưu chuyến đi', async () => {
      companiesService.findOne.mockResolvedValue({
        status: 'active',
        _id: payload.companyId,
      });

      const mockVehicle = {
        _id: payload.vehicleId,
        companyId: payload.companyId,
        status: VehicleStatus.ACTIVE,
        toObject: () => ({}),
      };
      vehiclesService.findOne.mockResolvedValue(mockVehicle);

      const mockCreatedTrip = { _id: new Types.ObjectId(), ...payload };
      tripsRepository.create.mockResolvedValue(mockCreatedTrip);

      const result = await service.create(payload as any);

      expect(tripsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 500000,
          status: TripStatus.SCHEDULED,
          availableSeatsCount: 2,
        }),
      );
      expect(result).toEqual(mockCreatedTrip);
    });
  });

  describe('Tầng nghiệp vụ: Cập nhật chuyến đi (update)', () => {
    const tripId = new Types.ObjectId().toString();
    const existingTrip = {
      _id: tripId,
      price: 200000,
      departureTime: new Date('2025-01-01T10:00:00Z'),
      seats: [{ seatNumber: 'A01', status: SeatStatus.AVAILABLE }],
    };

    it('Thành công: Cập nhật giá và thời gian khi chưa có ghế nào bị đặt', async () => {
      tripsRepository.findByIdWithDetails.mockResolvedValue(existingTrip);
      tripsRepository.update.mockResolvedValue({
        ...existingTrip,
        price: 300000,
      });

      const result = await service.update(tripId, { price: 300000 });

      expect(tripsRepository.update).toHaveBeenCalledWith(
        tripId,
        expect.objectContaining({ price: 300000 }),
      );
    });

    it('Ném lỗi Conflict nếu Đổi giá vé khi ĐÃ CÓ người đặt', async () => {
      tripsRepository.findByIdWithDetails.mockResolvedValue({
        ...existingTrip,
        seats: [{ seatNumber: 'A01', status: SeatStatus.BOOKED }],
      });

      await expect(service.update(tripId, { price: 400000 })).rejects.toThrow(
        ConflictException,
      );
    });

    it('Ném lỗi Conflict nếu Đổi giờ khởi hành khi ĐÃ CÓ người đặt', async () => {
      tripsRepository.findByIdWithDetails.mockResolvedValue({
        ...existingTrip,
        seats: [{ seatNumber: 'A01', status: SeatStatus.HELD }],
      });

      await expect(
        service.update(tripId, {
          departureTime: new Date('2025-01-01T12:00:00Z').toISOString(),
        }),
      ).rejects.toThrow('Không thể đổi giờ khởi hành khi đã có vé được đặt.');
    });
  });

  describe('Tầng nghiệp vụ: Hủy chuyến đi (cancel)', () => {
    const tripId = new Types.ObjectId().toString();

    it('Ném lỗi BadRequest nếu chuyến đi ĐÃ HOÀN THÀNH (ARRIVED)', async () => {
      tripsRepository.findById.mockResolvedValue({
        _id: tripId,
        status: TripStatus.ARRIVED,
      });

      await expect(service.cancel(tripId)).rejects.toThrow(BadRequestException);
    });

    it('Thành công: Đổi trạng thái, nhả ghế và phát tín hiệu (Event) hủy chuyến', async () => {
      const mockTrip = {
        _id: tripId,
        status: TripStatus.SCHEDULED,
        seats: [
          {
            seatNumber: 'A01',
            status: SeatStatus.BOOKED,
            bookingId: new Types.ObjectId(),
          },
        ],
      };
      tripsRepository.findById.mockResolvedValue(mockTrip);
      tripsRepository.save.mockResolvedValue(mockTrip);

      await service.cancel(tripId);

      expect(mockTrip.status).toBe(TripStatus.CANCELLED);
      expect(mockTrip.seats[0].status).toBe(SeatStatus.AVAILABLE);
      expect(mockTrip.seats[0].bookingId).toBeUndefined();

      expect(eventEmitter.emit).toHaveBeenCalledWith('trip.cancelled', {
        tripId,
      });
    });
  });
});
