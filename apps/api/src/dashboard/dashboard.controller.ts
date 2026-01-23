import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';

import { FinanceReportQuerySchema } from '@obtp/validation';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(sharedTypes.UserRole.ADMIN) // Hiện tại chỉ Admin xem được
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('finance-report')
  @UsePipes(new ZodValidationPipe(FinanceReportQuerySchema))
  async getFinancialReport(@Query() query: sharedTypes.FinanceReportQuery) {
    return this.dashboardService.getFinancialReport(query);
  }
}
