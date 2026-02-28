import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as sharedTypes from '@obtp/shared-types';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  // User đăng ký làm tài xế
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
  // ✅ Cho phép DRIVER (nếu enum có), COMPANY_ADMIN, ADMIN
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
}
