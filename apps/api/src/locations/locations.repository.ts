import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateLocationPayload,
  Location,
  LocationType,
} from '@obtp/shared-types';
import { Model, QueryFilter } from 'mongoose';
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
    return (await newDoc.save()) as unknown as Location;
  }

  async findById(id: string): Promise<Location | null> {
    return this.locationModel.findById(id).exec() as unknown as Location | null;
  }

  async findByNameAndProvince(
    name: string,
    province: string,
  ): Promise<Location | null> {
    return this.locationModel
      .findOne({ name, province })
      .exec() as unknown as Location | null;
  }

  async findAll(
    filter: QueryFilter<LocationDocument> = {},
  ): Promise<Location[]> {
    return this.locationModel
      .find(filter)
      .sort({ province: 1, name: 1 })
      .exec() as unknown as Location[];
  }

  async search(
    filter: QueryFilter<LocationDocument>,
    limit = 15,
  ): Promise<Location[]> {
    return this.locationModel
      .find(filter)
      .sort({ province: 1, name: 1 })
      .limit(limit)
      .exec() as unknown as Location[];
  }

  async findPopular(limit = 10): Promise<Location[]> {
    return this.locationModel
      .find({
        type: { $in: [LocationType.BUS_STATION, LocationType.CITY] },
        popular: true,
        isActive: true,
      })
      .sort({ routes: -1 })
      .limit(limit)
      .exec() as unknown as Location[];
  }
  async update(
    id: string,
    updateData: Partial<Location>,
  ): Promise<Location | null> {
    return this.locationModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec() as unknown as Location | null;
  }

  async delete(id: string): Promise<Location | null> {
    return this.locationModel
      .findByIdAndDelete(id)
      .exec() as unknown as Location | null;
  }
}
