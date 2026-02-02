import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';
import { CreateTripSchema, SearchTripQuerySchema } from '@obtp/validation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(SearchTripQuerySchema))
  async findPublicTrips(@Query() query: sharedTypes.SearchTripQuery) {
    return this.tripsService.findPublicTrips(query);
  }

  @Get('management/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async findForManagement(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query('companyId') filterCmpId: string,
  ) {
    let targetId = filterCmpId;
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (!user.companyId) throw new ForbiddenException();
      targetId = user.companyId;
    }
    return this.tripsService.findAllForManagement(targetId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(CreateTripSchema))
  async create(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.CreateTripPayload,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (payload.companyId !== user.companyId) throw new ForbiddenException();
    }
    return this.tripsService.create(payload);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async cancel(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') id: string,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      const trip = await this.tripsService.findOne(id);
      const tripCompanyId = trip.companyId._id
        ? trip.companyId._id.toString()
        : trip.companyId.toString();

      if (tripCompanyId !== user.companyId) throw new ForbiddenException();
    }
    return this.tripsService.cancel(id);
  }

  // 4. UPDATE TRIP (Manual Put/Patch handling)
  // ... Logic similar to create/cancel with ownership checks
}
