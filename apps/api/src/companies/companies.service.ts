import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import {
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from '@obtp/shared-types';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CompaniesRepository } from './companies.repository';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly repo: CompaniesRepository,
    @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async create(payload: CreateCompanyPayload): Promise<Company> {
    const existsByName = await this.repo.findOne({ name: payload.name });
    if (existsByName) {
      throw new ConflictException(`Nhà xe "${payload.name}" đã tồn tại.`);
    }
    const code = payload.code.toUpperCase();
    const existsByCode = await this.repo.findOne({ code });
    if (existsByCode) {
      throw new ConflictException(`Mã nhà xe "${code}" đã tồn tại.`);
    }

    const { adminName, adminEmail, adminPhone, ...companyInfo } = payload;
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const savedCompany = await this.repo.create(
        { ...companyInfo, code },
        session,
      );

      const { user: adminAccount, isNew } =
        await this.usersService.createOrPromoteCompanyAdmin({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          companyId: savedCompany.id,
        });

      if (isNew) {
        if (!adminAccount.accountActivationToken) {
          throw new InternalServerErrorException(
            'Lỗi: Không tạo được token kích hoạt.',
          );
        }
        await this.mailService.sendCompanyAdminActivationEmail({
          email: adminAccount.email,
          name: adminAccount.name,
          token: adminAccount.accountActivationToken,
        });
      } else {
        await this.mailService.sendCompanyAdminPromotionEmail({
          email: adminAccount.email,
          name: adminAccount.name,
          companyName: savedCompany.name,
        });
      }

      await session.commitTransaction();
      return savedCompany;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findAllWithStats() {
    return this.repo.getCompanyStats();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.repo.findById(id);
    if (!company) {
      throw new NotFoundException(`Không tìm thấy nhà xe ID: ${id}`);
    }
    return company;
  }

  async update(id: string, payload: UpdateCompanyPayload): Promise<Company> {
    const existing = await this.findOne(id);

    if (payload.name && payload.name !== existing.name) {
      const duplicateName = await this.repo.findOne({ name: payload.name });
      // Cần check duplicate._id != id, nhưng repository findOne trả về doc
      // Check thủ công:
      if (duplicateName && duplicateName.id.toString() !== id) {
        throw new ConflictException(`Tên nhà xe "${payload.name}" đã tồn tại.`);
      }
    }

    const updated = await this.repo.update(id, payload);
    if (!updated) throw new NotFoundException('Lỗi cập nhật nhà xe');

    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Nhà xe không tồn tại`);
    await this.repo.delete(id);

    // Note: Cần xem xét xóa Trips/Bookings hoặc User Admin liên quan
    // Nhưng tuân thủ Scope hiện tại -> chỉ xóa Company collection.
  }
}
