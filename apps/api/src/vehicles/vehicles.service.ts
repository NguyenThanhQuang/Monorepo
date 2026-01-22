import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// CONTRACTS & TYPES
import {
  CreateVehiclePayload,
  TripStatus,
  UpdateVehiclePayload,
  VehicleStatus,
} from '@obtp/shared-types';

// LOGIC & UTILS
import { calculateVehicleConfig } from '@obtp/business-logic';

// REPOS & SCHEMAS
import { VehiclesRepository } from './vehicles.repository';
// TODO: Refactor: Move checking logic to TripsService when available
import { Trip } from '../trips/schemas/trip.schema'; // Cần Trip schema để check conflict
// import { CompaniesService } from '../companies/companies.service'; // Enable if needing to check company exists

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehiclesRepository: VehiclesRepository,
    @InjectModel(Trip.name) private tripModel: Model<Trip>,
    // private readonly companiesService: CompaniesService,
  ) {}

  async create(payload: CreateVehiclePayload): Promise<any> {
    // 1. Verify Company exists (Optional if payload is trusted or relying on FK check)
    // await this.companiesService.findById(payload.companyId);

    // 2. Generate Seat Logic (PURE FUNCTION CALL)
    // Tách biệt hoàn toàn tính toán khỏi DB access
    const configResult = calculateVehicleConfig(
      payload.seatRows,
      payload.seatColumns,
      payload.aislePositions || [],
      payload.floors,
    );

    // 3. Save to Repo (Duplicate check handled in Repo)
    return this.vehiclesRepository.create({
      ...payload,
      companyId: new Types.ObjectId(payload.companyId),
      vehicleNumber: payload.vehicleNumber.toUpperCase(),
      totalSeats: configResult.totalSeats,
      seatMap: configResult.seatMapFloor1,
      seatMapFloor2: configResult.seatMapFloor2,
      aislePositions: payload.aislePositions || [], // ensure array
    });
  }

  async findAll(companyId?: string): Promise<any[]> {
    const filter: any = {};
    if (companyId) {
      if (!Types.ObjectId.isValid(companyId)) return [];
      filter.companyId = new Types.ObjectId(companyId);
    }
    return this.vehiclesRepository.findAll(filter);
  }

  async findOne(id: string): Promise<any> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) throw new NotFoundException('Phương tiện không tồn tại.');
    return vehicle;
  }

  async update(id: string, payload: UpdateVehiclePayload): Promise<any> {
    const existingVehicle = await this.findOne(id);

    // 1. Check duplicate number if changed
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

    // 2. Check if structure changes
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
      // 3. Integrity Check: Cannot change structure if upcoming trips exist
      const upcomingTrips = await this.tripModel.countDocuments({
        vehicleId: new Types.ObjectId(id),
        status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] }, // trip status pending migration check
      });

      if (upcomingTrips > 0) {
        throw new ConflictException(
          `Không thể sửa cấu trúc xe khi đang có ${upcomingTrips} chuyến đi hoạt động.`,
        );
      }

      // 4. Re-calculate Map
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

    // 5. Merge & Save
    // Ensure remove keys that are undefined to avoid overriding
    const updateData = {
      ...payload,
      vehicleNumber: payload.vehicleNumber?.toUpperCase(),
      ...calculatedData,
    };

    // Cleanup undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return this.vehiclesRepository.update(id, updateData);
  }

  async remove(id: string): Promise<any> {
    // Soft Delete (Status Inactive)
    const upcomingTrips = await this.tripModel.countDocuments({
      vehicleId: new Types.ObjectId(id),
      status: { $in: [TripStatus.SCHEDULED, TripStatus.DEPARTED] },
    });

    if (upcomingTrips > 0) {
      throw new ConflictException(
        `Không thể xóa xe khi đang có chuyến đi hoạt động.`,
      );
    }

    return this.vehiclesRepository.update(id, {
      status: VehicleStatus.INACTIVE,
    });
  }
}
