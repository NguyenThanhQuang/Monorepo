import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type {
  CreateLocationPayload,
  UpdateLocationPayload,
} from '@obtp/shared-types';
import { UserRole } from '@obtp/shared-types';
import { createLocationSchema, updateLocationSchema } from '@obtp/validation';
import { isValidObjectId } from 'mongoose';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('popular')
  async findPopular() {
    const data = await this.locationsService.findPopular();
    return data;
  }

  @Get('search')
  search(@Query('q') keyword: string) {
    return this.locationsService.search(keyword);
  }

  /**
   * ✅ NEW: /locations/province?province=Hà Nội
   * (Bạn cũng có thể dùng /locations?province=Hà Nội, nhưng giữ route này cho mobile)
   */
  @Get('province')
  findByProvince(@Query('province') province: string) {
    return this.locationsService.findAll({ province });
  }

  @Get()
  findAll(@Query('type') type?: any, @Query('province') province?: string) {
    return this.locationsService.findAll({ type, province });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // ✅ chặn /locations/province bị bắt nhầm vào :id (và chặn id sai)
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid location id');
    }
    return this.locationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createLocationSchema))
  create(@Body() payload: CreateLocationPayload) {
    return this.locationsService.create(payload);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateLocationSchema))
  update(@Param('id') id: string, @Body() payload: UpdateLocationPayload) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid location id');
    }
    return this.locationsService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid location id');
    }
    await this.locationsService.remove(id);
  }
}