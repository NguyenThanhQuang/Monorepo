// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Param,
//   Patch,
//   Post,
//   Query,
//   UseGuards,
//   UsePipes,
// } from '@nestjs/common';
// import type {
//   CreateLocationPayload,
//   UpdateLocationPayload,
// } from '@obtp/shared-types';
// import { UserRole } from '@obtp/shared-types';
// import { createLocationSchema, updateLocationSchema } from '@obtp/validation';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
// import { LocationsService } from './locations.service';

// @Controller('locations')
// export class LocationsController {
//   constructor(private readonly locationsService: LocationsService) {}

//   @Get('popular')
//   findPopular() {
//     return this.locationsService.findPopular();
//   }

//   @Get('search')
//   search(@Query('q') keyword: string) {
//     return this.locationsService.search(keyword);
//   }

//   @Get()
//   findAll(@Query('type') type?: any, @Query('province') province?: string) {
//     return this.locationsService.findAll({ type, province });
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.locationsService.findOne(id);
//   }

//   // --- SECURED ROUTES ---

//   @Post()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   @HttpCode(HttpStatus.CREATED)
//   @UsePipes(new ZodValidationPipe(createLocationSchema))
//   create(@Body() payload: CreateLocationPayload) {
//     return this.locationsService.create(payload);
//   }

//   @Patch(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   @UsePipes(new ZodValidationPipe(updateLocationSchema))
//   update(@Param('id') id: string, @Body() payload: UpdateLocationPayload) {
//     return this.locationsService.update(id, payload);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async remove(@Param('id') id: string) {
//     await this.locationsService.remove(id);
//   }
// }
