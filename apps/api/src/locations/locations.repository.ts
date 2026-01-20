import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateLocationPayload,
  Location,
  LocationType,
} from '@obtp/shared-types';
import { QueryFilter, Model } from 'mongoose';
import {
  LocationDefinition,
  LocationDocument,
} from './schemas/location.schema';

@Injectable()
export class LocationsRepository {
  constructor(
    @InjectModel(LocationDefinition.name)
    private readonly locationModel: Model<LocationDocument>,
  ) {}

  async create(
    payload: CreateLocationPayload & { slug: string },
  ): Promise<Location> {
    const newDoc = new this.locationModel(payload);
    return newDoc.save();
  }

  async findById(id: string): Promise<Location | null> {
    return this.locationModel.findById(id).exec();
  }

  // Hàm check trùng (Composite Unique Check)
  async findByNameAndProvince(
    name: string,
    province: string,
  ): Promise<Location | null> {
    return this.locationModel.findOne({ name, province }).exec();
  }

  async findAll(
    filter: QueryFilter<LocationDocument> = {},
  ): Promise<Location[]> {
    return this.locationModel
      .find(filter)
      .sort({ province: 1, name: 1 })
      .exec();
  }

  async search(
    filter: QueryFilter<LocationDocument>,
    limit = 15,
  ): Promise<Location[]> {
    return this.locationModel
      .find(filter)
      .sort({ province: 1, name: 1 })
      .limit(limit)
      .exec();
  }

  async findPopular(limit = 10): Promise<Location[]> {
    return this.locationModel
      .find({
        type: { $in: [LocationType.BUS_STATION, LocationType.CITY] },
        isActive: true,
      })
      .sort({ province: 1 })
      .limit(limit)
      .exec();
  }

  async update(
    id: string,
    updateData: Partial<Location>,
  ): Promise<Location | null> {
    return this.locationModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Location | null> {
    return this.locationModel.findByIdAndDelete(id).exec();
  }
}
