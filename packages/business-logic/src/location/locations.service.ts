import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import {
  buildLocationSearchFilter,
} from '@obtp/business-logic/locations/location.logic';
import {
  CreateLocationSchema,
  UpdateLocationInput,
} from '@obtp/validation';

@Injectable()
export class LocationsService {
  constructor(private readonly repo: LocationsRepository) {}

  async create(payload: CreateLocationSchema) {
    const existing = await this.repo.findOne({
      name: payload.name,
      province: payload.province,
    });

    if (existing) {
      throw new ConflictException(
        `Địa điểm "${payload.name}" tại "${payload.province}" đã tồn tại.`,
      );
    }

    return this.repo.create(payload);
  }

  async findAll(query = {}) {
    return this.repo.findAll(query);
  }

  async search(keyword: string) {
    const filter = buildLocationSearchFilter(keyword);
    if (!filter) return [];

    return this.repo.search(filter, 15);
  }

  async findOne(id: string) {
    const location = await this.repo.findById(id);
    if (!location) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID: ${id}`);
    }
    return location;
  }

  async update(id: string, payload: UpdateLocationInput) {
    const updated = await this.repo.update(id, payload);
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID: ${id}`);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID: ${id}`);
    }
    return deleted;
  }

  async findPopularLocations(limit = 10) {
    return this.repo.findPopular(limit);
  }
}
