/// <reference types="jest" />

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';

import { MapsService } from './maps.service';

describe('MapsService', () => {
  let service: MapsService;
  let httpService: any;
  let configService: any;

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue: any) => {
        if (key === 'OSRM_API_URL') return 'http://mock-osrm.local';
        if (key === 'ROUTE_DURATION_MULTIPLIER') return 1.2; 
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRouteInfo', () => {
    const waypoints = [
      { lat: 21.0285, lng: 105.8542 },
      { lat: 10.8231, lng: 106.6297 },
    ];

    it('Ném lỗi BadRequest nếu danh sách tọa độ ít hơn 2 điểm', async () => {
      await expect(service.getRouteInfo([{ lat: 0, lng: 0 }])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('Thành công: Gọi API OSRM và tính toán lại thời gian dựa trên hệ số nhân (Multiplier)', async () => {
      const mockOsrmResponse: Partial<AxiosResponse> = {
        data: {
          code: 'Ok',
          routes: [
            {
              geometry: 'mocked_polyline_string',
              distance: 1000,
              duration: 100,
              legs: [{ duration: 100 }],
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockOsrmResponse));

      const result = await service.getRouteInfo(waypoints);

      const expectedUrl = `http://mock-osrm.local/route/v1/driving/105.8542,21.0285;106.6297,10.8231?overview=full&geometries=polyline&annotations=duration,distance`;
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);

      expect(result.duration).toBe(120);
      expect(result.distance).toBe(1000);
      expect(result.polyline).toBe('mocked_polyline_string');
      expect(result.legDurations).toEqual([120]);
    });

    it('Ném lỗi InternalServerError nếu OSRM trả về code != Ok (Không tìm thấy đường)', async () => {
      const mockFailResponse = {
        data: {
          code: 'NoRoute',
          routes: [],
        },
      };
      httpService.get.mockReturnValue(of(mockFailResponse));

      await expect(service.getRouteInfo(waypoints)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('Ném lỗi InternalServerError nếu gọi HTTP thất bại (Mất mạng / OSRM sập)', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network Error')),
      );

      await expect(service.getRouteInfo(waypoints)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
