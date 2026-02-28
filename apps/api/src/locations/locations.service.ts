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

  // locations.service.ts
private normalizeKeyword(keyword: string) {
  const k = (keyword || "").trim();
  const lower = k.toLowerCase();

  // map common aliases
  if (
    lower.includes("tp.hcm") ||
    lower.includes("tp hcm") ||
    lower.includes("tphcm") ||
    lower.includes("tp. hồ chí minh") ||
    lower.includes("thành phố hồ chí minh")
  ) {
    return "Hồ Chí Minh";
  }

  if (lower.includes("thành phố hà nội")) return "Hà Nội";
  return k;
}



  async create(payload: CreateLocationPayload): Promise<Location> {
    const exists = await this.repo.findByNameAndProvince(
      payload.name,
      payload.province,
    );
    if (exists) {
      throw new ConflictException(
        `Địa điểm "${payload.name}" tại "${payload.province}" đã tồn tại.`,
      );
    }

    const slug = generateLocationSlug(payload.name);

    return this.repo.create({ ...payload, slug });
  }

  async findAll(queryData: SearchLocationQuery): Promise<Location[]> {
    const filter: any = {};
    if (queryData.type) filter.type = queryData.type;
    if (queryData.province) {
      filter.province = new RegExp(queryData.province, 'i');
    }
    return this.repo.findAll(filter);
  }

  async search(keyword: string): Promise<Location[]> {
    const raw = (keyword || '').trim();
    if (!raw) return [];

    const normalized = raw
      .replace(/^tp\.?\s*/i, '') // "TP. " -> ""
      .replace(/^thành phố\s+/i, '') // "Thành phố " -> ""
      .trim();

    const rx1 = createSafeSearchRegex(raw);
    const rx2 = createSafeSearchRegex(normalized);

    const or: any[] = [];

    if (rx1) {
      or.push(
        { name: { $regex: rx1 } },
        { province: { $regex: rx1 } },
        { slug: { $regex: rx1 } },
      );
    }

    if (rx2 && normalized.toLowerCase() !== raw.toLowerCase()) {
      or.push(
        { name: { $regex: rx2 } },
        { province: { $regex: rx2 } },
        { slug: { $regex: rx2 } },
      );
    }

    if (or.length === 0) return [];

    return this.repo.search({ $or: or }, 15);
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
