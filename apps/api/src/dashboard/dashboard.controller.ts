import { Controller, Get, Query, UseGuards, UsePipes, Res } from '@nestjs/common';
import { Response } from 'express'; // Đảm bảo import này đúng
import * as sharedTypes from '@obtp/shared-types';
import { FinanceReportQuerySchema } from '@obtp/validation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(sharedTypes.UserRole.ADMIN)
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

  // SỬA LỖI 404 VÀ THIẾU METHOD TẠI ĐÂY
  @Get('finance-report/export')
  @UsePipes(new ZodValidationPipe(FinanceReportQuerySchema))
  async exportExcel(
    @Query() query: sharedTypes.FinanceReportQuery,
    @Res() res: Response,
  ) {
    const buffer = await this.dashboardService.exportRevenueToExcel(query);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=Bao_Cao_Doanh_Thu_OBTP.xlsx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}