import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createSafeSearchRegex,
  generateLocationSlug,
} from '@obtp/business-logic';
import {
  CreateLocationPayload,
  Location,
  SearchLocationQuery,
  UpdateLocationPayload,
} from '@obtp/shared-types';

import { LocationsRepository } from './locations.repository';

@Injectable()
export class LocationsService {
  constructor(private readonly repo: LocationsRepository) {}

  async create(payload: CreateLocationPayload): Promise<Location> {
    // Logic check trùng
    const exists = await this.repo.findByNameAndProvince(
      payload.name,
      payload.province,
    );
    if (exists) {
      throw new ConflictException(
        `Địa điểm "${payload.name}" tại "${payload.province}" đã tồn tại.`,
      );
    }

    // Logic Generate Slug (dùng Logic Package)
    const slug = generateLocationSlug(payload.name);

    //Delegate to Repo
    return this.repo.create({ ...payload, slug });
  }

  async findAll(queryData: SearchLocationQuery): Promise<Location[]> {
    const filter: any = {};
    if (queryData.type) filter.type = queryData.type;
    if (queryData.province) {
      // Search regex province không phân biệt hoa thường
      filter.province = new RegExp(queryData.province, 'i');
    }
    return this.repo.findAll(filter);
  }

  async search(keyword: string): Promise<Location[]> {
    // Logic tạo Regex an toàn nằm trong business-logic package
    const searchRegex = createSafeSearchRegex(keyword);

    if (!searchRegex) {
      return [];
    }

    const filter = {
      $or: [
        { name: { $regex: searchRegex } },
        { province: { $regex: searchRegex } },
      ],
    };

    return this.repo.search(filter, 15);
  }

  async findOne(id: string): Promise<Location> {
    const loc = await this.repo.findById(id);
    if (!loc) throw new NotFoundException('Không tìm thấy địa điểm');
    return loc;
  }

  async findPopular(limit = 10): Promise<Location[]> {
    return this.repo.findPopular(limit);
  }

  async update(id: string, payload: UpdateLocationPayload): Promise<Location> {
    const updateData: any = { ...payload };

    // Nếu đổi tên -> đổi Slug
    if (payload.name) {
      updateData.slug = generateLocationSlug(payload.name);
    }

    const updated = await this.repo.update(id, updateData);
    if (!updated)
      throw new NotFoundException('Không tìm thấy địa điểm để update');

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundException('Không tìm thấy địa điểm để xóa');
  }
}
