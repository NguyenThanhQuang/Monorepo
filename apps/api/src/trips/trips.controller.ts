import {
  BadRequestException,
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

   @Get("active")
  async listActive(@Query("date") date?: string) {
    const trips = await this.tripsService.findActiveTrips(date);
    return { success: true, data: trips, count: trips.length };
  }

  @Get('management/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async findForManagement(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query('companyId') filterCmpId: string,
  ) {
    try {
      let targetId = filterCmpId;

      if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
        if (!user.companyId) {
          throw new ForbiddenException('Không tìm thấy companyId của bạn');
        }
        targetId = user.companyId;
      }

      console.log('Controller - Finding trips for companyId:', targetId);
      const trips = await this.tripsService.findAllForManagement(targetId);

      return {
        success: true,
        data: trips,
        count: trips.length,
      };
    } catch (error) {
      console.error('Error in findForManagement:', error);
      throw error;
    }
  }

  // ===== SEARCH ROUTES (ĐẶT TRƯỚC :id) =====

@Get('search')
async searchTrips(
  @Query('fromLocationId') fromLocationId: string,
  @Query('toLocationId') toLocationId: string,
  @Query('date') date: string,
  @Query('includeDeparted') includeDeparted?: string,
) {
  if (!fromLocationId || !toLocationId || !date) {
    throw new BadRequestException('Missing required search parameters');
  }

  const include = includeDeparted !== 'false'; // default true

  console.log('[/trips/search] query =', {
    fromLocationId,
    toLocationId,
    date,
    includeDeparted: include,
  });

  const trips = await this.tripsService.searchTripsByLocationId(
    fromLocationId,
    toLocationId,
    date,
    { includeDeparted: include },
  );

  return { success: true, data: trips, count: trips.length };
}

  @Get('search/from')
  searchByFrom(@Query('fromId') fromId: string) {
    return this.tripsService.searchByFrom(fromId);
  }

  // ===== CREATE =====

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(CreateTripSchema))
  async create(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.CreateTripPayload,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (payload.companyId !== user.companyId) {
        throw new ForbiddenException();
      }
    }

    const trip = await this.tripsService.create(payload);

    return {
      success: true,
      data: trip,
      message: 'Tạo chuyến đi thành công',
    };
  }

  // ===== CANCEL =====

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async cancel(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') id: string,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      const trip = await this.tripsService.findOne(id);

      const tripCompanyId =
        (trip.companyId as any)?._id?.toString?.() ?? trip.companyId.toString();

      if (tripCompanyId !== user.companyId) {
        throw new ForbiddenException();
      }
    }

    return this.tripsService.cancel(id);
  }

  // ===== GET BY ID (LUÔN ĐẶT CUỐI) =====

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trip = await this.tripsService.findOne(id);
    return {
      success: true,
      data: trip,
    };
  }
}
