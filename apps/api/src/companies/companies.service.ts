import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// Removed InjectConnection import
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
    // Removed @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async create(payload: CreateCompanyPayload): Promise<Company> {
    // Kiểm tra trùng lặp
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

    // Tạo company trước
    const savedCompany = await this.repo.create({ ...companyInfo, code });

    try {
      // Tạo hoặc thăng chức company admin
      const { user: adminAccount, isNew } =
        await this.usersService.createOrPromoteCompanyAdmin({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          companyId: savedCompany.id,
        });

      // Gửi email tương ứng
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

      return savedCompany;
    } catch (error) {
      // Nếu có lỗi khi tạo user hoặc gửi email, rollback thủ công: xóa company vừa tạo
      await this.repo.delete(savedCompany.id).catch((deleteError) => {
        // Log lỗi nếu không xóa được, nhưng vẫn throw lỗi gốc
        console.error('Failed to delete company after user creation error:', deleteError);
      });
      throw error;
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
  }
}