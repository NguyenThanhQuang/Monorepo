import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, QueryFilter, Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';

@Injectable()
export class VehiclesRepository {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(
    doc: Partial<Vehicle>,
    session?: ClientSession,
  ): Promise<VehicleDocument> {
    try {
      const newVehicle = new this.vehicleModel(doc);
      return await newVehicle.save({ session });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
        throw new ConflictException(
          'Biển số xe đã tồn tại trong hệ thống của nhà xe này.',
        );
      }
      throw error;
    }
  }

  async findOne(
    filter: QueryFilter<VehicleDocument>,
  ): Promise<VehicleDocument | null> {
    return this.vehicleModel.findOne(filter).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<VehicleDocument | null> {
    if (!Types.ObjectId.isValid(id.toString())) return null;
    return this.vehicleModel
      .findById(id)
      .populate('companyId', 'name code')
      .exec();
  }

  async findAll(
    filter: QueryFilter<VehicleDocument> = {},
  ): Promise<VehicleDocument[]> {
    return this.vehicleModel
      .find(filter)
      .populate('companyId', 'name code')
      .sort({ updatedAt: -1 })
      .exec();
  }

  // Hỗ trợ check trùng khi Update (ngo trừ chính nó)
  async checkDuplicateNumber(
    companyId: string | Types.ObjectId,
    vehicleNumber: string,
    excludeId: string,
  ): Promise<boolean> {
    const exist = await this.vehicleModel
      .findOne({
        companyId,
        vehicleNumber: vehicleNumber.toUpperCase(),
        _id: { $ne: excludeId },
      })
      .exec();
    return !!exist;
  }

  async update(
    id: string,
    updateData: Partial<Vehicle>,
    session?: ClientSession,
  ): Promise<VehicleDocument | null> {
    return this.vehicleModel
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .populate('companyId', 'name code') // Return populate
      .exec();
  }
}
