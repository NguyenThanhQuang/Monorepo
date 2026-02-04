import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleStatus,
} from '@obtp/shared-types';

import { TripsService } from '@/trips/trips.service';
import { calculateVehicleConfig } from '@obtp/business-logic';
import { VehicleDocument } from './schemas/vehicle.schema';
import { VehiclesRepository } from './vehicles.repository';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehiclesRepository: VehiclesRepository,
    @Inject(forwardRef(() => TripsService))
    private readonly tripsService: TripsService,
  ) {}

  async create(payload: CreateVehiclePayload): Promise<VehicleDocument> {
    const configResult = calculateVehicleConfig(
      payload.seatRows,
      payload.seatColumns,
      payload.aislePositions || [],
      payload.floors,
    );

    return this.vehiclesRepository.create({
      ...payload,
      companyId: new Types.ObjectId(payload.companyId),
      vehicleNumber: payload.vehicleNumber.toUpperCase(),
      totalSeats: configResult.totalSeats,
      seatMap: configResult.seatMapFloor1,
      seatMapFloor2: configResult.seatMapFloor2,
      aislePositions: payload.aislePositions || [],
    });
  }

async findAll(companyId?: string): Promise<VehicleDocument[]> {
  console.log('🔍🔍🔍 VEHICLES SERVICE DEBUG 🔍🔍🔍');
  console.log('Input companyId:', companyId);
  console.log('Input length:', companyId?.length);
  console.log('Expected ObjectId length: 24');
  
  const filter: any = {};
  
  if (companyId) {
    // Kiểm tra ObjectId hợp lệ
    console.log('Checking ObjectId validity...');
    const isValid = Types.ObjectId.isValid(companyId);
    console.log('Is valid ObjectId?', isValid);
    
    if (!isValid) {
      console.log('❌ INVALID ObjectId format!');
      console.log('Provided:', companyId);
      console.log('Length:', companyId.length);
      console.log('Should be 24 hex characters');
      return [];
    }
    
    // Tạo ObjectId
    const objectId = new Types.ObjectId(companyId);
    console.log('Created ObjectId:', objectId);
    console.log('ObjectId toString:', objectId.toString());
    console.log('ObjectId toHexString:', objectId.toHexString());
    
    // So sánh
    console.log('Comparison:');
    console.log('- Input:', companyId);
    console.log('- toHexString:', objectId.toHexString());
    console.log('- Match?', companyId === objectId.toHexString());
    
    filter.companyId = objectId;
    console.log('Filter to use:', filter);
  } else {
    console.log('No companyId provided - will return all vehicles');
  }
  
  console.log('Calling repository with filter:', JSON.stringify(filter));
  const vehicles = await this.vehiclesRepository.findAll(filter);
  console.log(`✅ Repository returned ${vehicles.length} vehicles`);
  
  return vehicles;
}
  async findOne(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) throw new NotFoundException('Phương tiện không tồn tại.');
    return vehicle;
  }

  async update(
    id: string,
    payload: UpdateVehiclePayload,
  ): Promise<VehicleDocument | null> {
    const existingVehicle = await this.findOne(id);

    if (
      payload.vehicleNumber &&
      payload.vehicleNumber.toUpperCase() !== existingVehicle.vehicleNumber
    ) {
      const isDuplicated = await this.vehiclesRepository.checkDuplicateNumber(
        existingVehicle.companyId,
        payload.vehicleNumber,
        id,
      );
      if (isDuplicated)
        throw new ConflictException(
          `Biển số ${payload.vehicleNumber} đã tồn tại.`,
        );
    }

    const currentRows = existingVehicle.seatRows;
    const currentCols = existingVehicle.seatColumns;
    const currentFloors = existingVehicle.floors;
    const currentAisles = JSON.stringify(existingVehicle.aislePositions.sort());

    const newRows = payload.seatRows ?? currentRows;
    const newCols = payload.seatColumns ?? currentCols;
    const newFloors = payload.floors ?? currentFloors;
    const newAislesRaw =
      payload.aislePositions ?? existingVehicle.aislePositions;
    const newAislesStr = JSON.stringify(newAislesRaw.sort());

    const isStructureChanged =
      newRows !== currentRows ||
      newCols !== currentCols ||
      newFloors !== currentFloors ||
      newAislesStr !== currentAisles;

    let calculatedData = {};

    if (isStructureChanged) {
      const hasTrips = await this.tripsService.checkVehicleHasActiveTrips(id);

      if (hasTrips) {
        throw new ConflictException(
          `Không thể sửa cấu trúc xe khi đang có chuyến đi hoạt động.`,
        );
      }

      const configResult = calculateVehicleConfig(
        newRows,
        newCols,
        newAislesRaw,
        newFloors,
      );

      calculatedData = {
        totalSeats: configResult.totalSeats,
        seatMap: configResult.seatMapFloor1,
        seatMapFloor2: configResult.seatMapFloor2,
      };
    }

    const updateData = {
      ...payload,
      vehicleNumber: payload.vehicleNumber?.toUpperCase(),
      ...calculatedData,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return this.vehiclesRepository.update(id, updateData);
  }

  async remove(id: string): Promise<VehicleDocument | null> {
    const hasTrips = await this.tripsService.checkVehicleHasActiveTrips(id);

    if (hasTrips) {
      throw new ConflictException(
        `Không thể xóa xe khi đang có chuyến đi hoạt động.`,
      );
    }

    return this.vehiclesRepository.update(id, {
      status: VehicleStatus.INACTIVE,
    });
  }
}
