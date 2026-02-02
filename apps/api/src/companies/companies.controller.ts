import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';
import { createCompanySchema, updateCompanySchema } from '@obtp/validation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CompaniesService } from './companies.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: sharedTypes.UserRole[];
    companyId?: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(sharedTypes.UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createCompanySchema))
  create(@Body() payload: sharedTypes.CreateCompanyPayload) {
    return this.companiesService.create(payload);
  }

  @Get()
  @Roles(sharedTypes.UserRole.ADMIN)
  findAll() {
    return this.companiesService.findAllWithStats();
  }

  @Get('my-company')
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN)
  getMyCompany(@Req() req: AuthenticatedRequest) {
    const { companyId } = req.user;
    if (!companyId) {
      throw new ForbiddenException(
        'Tài khoản này chưa liên kết với nhà xe nào.',
      );
    }
    return this.companiesService.findOne(companyId);
  }

  @Get(':id')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { roles, companyId } = req.user;

    if (roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (!companyId || companyId !== id) {
        throw new ForbiddenException('Bạn chỉ xem được công ty của mình.');
      }
    }

    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(updateCompanySchema))
  async update(
    @Param('id') id: string,
    @Body() payload: sharedTypes.UpdateCompanyPayload,
    @Req() req: AuthenticatedRequest,
  ) {
    const { roles, companyId } = req.user;

    if (roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (!companyId || companyId !== id) {
        throw new ForbiddenException('Bạn chỉ được sửa công ty của mình.');
      }
    }

    return this.companiesService.update(id, payload);
  }

  @Delete(':id')
  @Roles(sharedTypes.UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
