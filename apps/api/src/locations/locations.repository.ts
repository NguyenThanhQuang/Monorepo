import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '@obtp/shared-types';
import {
  LocationEntity,
  LocationDocument,
} from './schemas/location.schema';

@Injectable()
export class LocationsRepository {
  constructor(
    @InjectModel(LocationEntity.name)
    private readonly model: Model<LocationDocument>,
  ) {}

private toDomain(doc: LocationDocument): Location {
  const obj = doc.toObject();

  return {
    id: obj._id.toString(),
    name: obj.name,
    slug: obj.slug,
    province: obj.province,
    district: obj.district,
    fullAddress: obj.fullAddress,
    location: obj.location,
    type: obj.type,
    images: obj.images,
    isActive: obj.isActive,
    createdAt: obj.createdAt.toString(),
    updatedAt: obj.updatedAt.toString(),
  };
}


  async create(data: Partial<Location>): Promise<Location> {
    const doc = new this.model(data);
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findOne(filter: any): Promise<Location | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Location | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(filter: any = {}): Promise<Location[]> {
    const docs = await this.model.find(filter).exec();
    return docs.map((doc) => this.toDomain(doc));
  }
}
