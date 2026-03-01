import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';
import {
  CreateDriverSchema,
  UpdateDriverSchema,
} from '@obtp/validation/src/driver.zod';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  register(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body()
    body: {
      licenseNumber: string;
      idCardNumber: string;
      experienceYears?: number;
    },
  ) {
    return this.drivers.registerDriver(user, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.drivers.getMyDriverProfile(user);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    (sharedTypes.UserRole as any).DRIVER ?? ('driver' as any),
    sharedTypes.UserRole.COMPANY_ADMIN,
    sharedTypes.UserRole.ADMIN,
  )
  validate(
    @Body() body: { ticketId: string },
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.drivers.validateTicket(body.ticketId, user);
  }

  @Post('confirm-ticket')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    (sharedTypes.UserRole as any).DRIVER ?? ('driver' as any),
    sharedTypes.UserRole.COMPANY_ADMIN,
    sharedTypes.UserRole.ADMIN,
  )
  confirm(
    @Body() body: { ticketId: string },
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.drivers.confirmTicket(body.ticketId, user);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN, sharedTypes.UserRole.ADMIN)
  getCompanyDrivers(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    if (!user.companyId)
      throw new ForbiddenException('Tài khoản chưa liên kết nhà xe.');
    return this.drivers.getCompanyDrivers(user.companyId);
  }

  @Post('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN, sharedTypes.UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateDriverSchema))
  createCompanyDriver(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.CreateDriverPayload,
  ) {
    if (!user.companyId)
      throw new ForbiddenException('Tài khoản chưa liên kết nhà xe.');
    return this.drivers.createCompanyDriver(user.companyId, payload);
  }

  @Patch('company/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN, sharedTypes.UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateDriverSchema))
  updateCompanyDriver(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') driverId: string,
    @Body() payload: sharedTypes.UpdateDriverPayload,
  ) {
    if (!user.companyId)
      throw new ForbiddenException('Tài khoản chưa liên kết nhà xe.');
    return this.drivers.updateCompanyDriver(user.companyId, driverId, payload);
  }

  @Delete('company/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN, sharedTypes.UserRole.ADMIN)
  deleteCompanyDriver(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') driverId: string,
  ) {
    if (!user.companyId)
      throw new ForbiddenException('Tài khoản chưa liên kết nhà xe.');
    return this.drivers.deleteCompanyDriver(user.companyId, driverId);
  }
}
