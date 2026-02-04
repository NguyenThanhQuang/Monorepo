import {
  Body,
  Controller,
  Delete,
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

import { CreateVehicleSchema, UpdateVehicleSchema } from '@obtp/validation';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { VehiclesService } from './vehicles.service';
import { Types } from 'mongoose';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(CreateVehicleSchema))
  async create(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.CreateVehiclePayload,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (!user.companyId || payload.companyId !== user.companyId) {
        throw new ForbiddenException('Chỉ được tạo xe cho công ty của mình.');
      }
    }
    return this.vehiclesService.create(payload);
  }

@Get()
@Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
async findAll(
  @CurrentUser() user: sharedTypes.AuthUserResponse,
  @Query('companyId') filterCompanyId: string,
) {
  console.log('=== VEHICLES CONTROLLER ===');
  console.log('User roles:', user.roles);
  console.log('User companyId:', user.companyId);
  console.log('Requested companyId:', filterCompanyId);
  
  let targetCompanyId = filterCompanyId;

  if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
    if (!user.companyId) {
      throw new ForbiddenException('User chưa liên kết công ty.');
    }
    
    // Nếu COMPANY_ADMIN không specify companyId, dùng company của họ
    if (!filterCompanyId) {
      targetCompanyId = user.companyId;
      console.log('Using user companyId (no filter):', targetCompanyId);
    } 
    // Nếu COMPANY_ADMIN specify companyId, kiểm tra xem có phải công ty của họ không
    else if (filterCompanyId !== user.companyId) {
      console.log('WARNING: COMPANY_ADMIN trying to access other company!');
      console.log('Requested:', filterCompanyId, 'Owned:', user.companyId);
      throw new ForbiddenException('Chỉ được xem xe của công ty mình.');
    }
    // Nếu trùng, cho phép
    else {
      targetCompanyId = filterCompanyId;
      console.log('Using requested companyId (same as user):', targetCompanyId);
    }
  }
  
  console.log('Final targetCompanyId:', targetCompanyId);
  
  const vehicles = await this.vehiclesService.findAll(targetCompanyId);
  
  console.log(`✅ Found ${vehicles.length} vehicles`);
  
  // Transform data
  const transformedVehicles = vehicles.map(vehicle => {
    const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
    
    return {
      ...vehicleObj,
      companyId: vehicleObj.companyId?._id?.toString() || 
                 vehicleObj.companyId?.toString() || 
                 vehicleObj.companyId
    };
  });
  
  return {
    statusCode: 200,
    message: 'Success',
    data: transformedVehicles,
    debug: {
      userCompanyId: user.companyId,
      requestedCompanyId: filterCompanyId,
      usedCompanyId: targetCompanyId,
      vehiclesCount: transformedVehicles.length
    }
  };
}// Thêm endpoint mới - chỉ trả về vehicles của user
@Get('my-company')
@Roles(sharedTypes.UserRole.COMPANY_ADMIN)
async getMyCompanyVehicles(
  @CurrentUser() user: sharedTypes.AuthUserResponse,
) {
  console.log('=== GET MY COMPANY VEHICLES ===');
  console.log('User companyId:', user.companyId);
  
  if (!user.companyId) {
    throw new ForbiddenException('User chưa liên kết công ty.');
  }
  
  const vehicles = await this.vehiclesService.findAll(user.companyId);
  
  console.log(`✅ Found ${vehicles.length} vehicles for company ${user.companyId}`);
  
  // Transform data
  const transformedVehicles = vehicles.map(vehicle => {
    const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
    
    return {
      ...vehicleObj,
      companyId: vehicleObj.companyId?._id?.toString() || 
                 vehicleObj.companyId?.toString() || 
                 vehicleObj.companyId
    };
  });
  
  return {
    statusCode: 200,
    message: 'Success',
    data: transformedVehicles,
    companyId: user.companyId,
    count: transformedVehicles.length
  };
}

  // THÊM ENDPOINT MỚI: /vehicles/companyId/{companyId}
  @Get('companyId/:companyId')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async findByCompanyId(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('companyId') companyId: string,
  ) {
    console.log('=== VEHICLES CONTROLLER findByCompanyId() ===');
    console.log('Requested companyId:', companyId);
    console.log('User roles:', user.roles);
    console.log('User companyId:', user.companyId);
    
    // Kiểm tra quyền cho COMPANY_ADMIN
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (!user.companyId) {
        throw new ForbiddenException('User chưa liên kết công ty.');
      }
      if (user.companyId !== companyId) {
        throw new ForbiddenException('Chỉ được xem xe của công ty mình.');
      }
    }
    
    const vehicles = await this.vehiclesService.findAll(companyId);
    
    console.log(`Found ${vehicles.length} vehicles for company ${companyId}`);
    
    // Transform data
    const transformedVehicles = vehicles.map(vehicle => {
      const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
      
      return {
        ...vehicleObj,
        // Đảm bảo companyId là string
        companyId: vehicleObj.companyId?._id?.toString() || 
                   vehicleObj.companyId?.toString() || 
                   vehicleObj.companyId
      };
    });
    
    return {
      statusCode: 200,
      message: 'Success',
      data: transformedVehicles
    };
  }

  @Get(':id')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async findOne(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') id: string,
  ) {
    const vehicle = await this.vehiclesService.findOne(id);

    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      if (
        vehicle.companyId?._id?.toString() !== user.companyId &&
        vehicle.companyId?.toString() !== user.companyId
      ) {
        throw new ForbiddenException('Không có quyền xem xe của công ty khác.');
      }
    }
    return vehicle;
  }

  @Patch(':id')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateVehicleSchema))
  async update(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') id: string,
    @Body() payload: sharedTypes.UpdateVehiclePayload,
  ) {
    const vehicle = await this.vehiclesService.findOne(id);

    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      const ownerId = vehicle.companyId._id
        ? vehicle.companyId._id.toString()
        : vehicle.companyId.toString();
      if (ownerId !== user.companyId) {
        throw new ForbiddenException('Không có quyền sửa xe công ty khác.');
      }
    }
    return this.vehiclesService.update(id, payload);
  }
// vehicles.controller.ts
@Get('debug/test-id')
@Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN) // Thêm COMPANY_ADMIN
async debugTestId(
  @CurrentUser() user: sharedTypes.AuthUserResponse,
  @Query('id') id: string
) {
  console.log('=== DEBUG TEST ID ===');
  console.log('User:', user.id, 'Roles:', user.roles);
  console.log('User companyId:', user.companyId);
  console.log('Testing ObjectId:', id);
  
  // COMPANY_ADMIN chỉ được test company của mình
  if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
    if (!user.companyId) {
      throw new ForbiddenException('User chưa liên kết công ty.');
    }
    if (id !== user.companyId) {
      throw new ForbiddenException('Chỉ được debug công ty của mình.');
    }
  }
  
  const isValid = Types.ObjectId.isValid(id);
  const objectId = new Types.ObjectId(id);
  
  // Test query trực tiếp
  const count = await this.vehiclesService['vehiclesRepository']['vehicleModel']
    .countDocuments({ companyId: objectId })
    .exec();
  
  // Test với string
  const countString = await this.vehiclesService['vehiclesRepository']['vehicleModel']
    .countDocuments({ companyId: id })
    .exec();
  
  // Test tất cả vehicles để xem companyId nào tồn tại
  const sampleVehicles = await this.vehiclesService['vehiclesRepository']['vehicleModel']
    .find({ companyId: objectId })
    .limit(5)
    .select('_id vehicleNumber companyId')
    .lean()
    .exec();
  
  return {
    inputId: id,
    length: id.length,
    isValidObjectId: isValid,
    objectIdCreated: objectId.toString(),
    objectIdHex: objectId.toHexString(),
    countWithObjectId: count,
    countWithString: countString,
    sampleVehicles: sampleVehicles.map(v => ({
      id: v._id,
      vehicleNumber: v.vehicleNumber,
      companyId: v.companyId,
      companyId_type: typeof v.companyId,
      companyId_string: v.companyId?.toString()
    })),
    message: 'Debug completed'
  };
}
  @Delete(':id')
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  async remove(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Param('id') id: string,
  ) {
    const vehicle = await this.vehiclesService.findOne(id);
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      const ownerId = vehicle.companyId._id
        ? vehicle.companyId._id.toString()
        : vehicle.companyId.toString();
      if (ownerId !== user.companyId) throw new ForbiddenException();
    }
    return this.vehiclesService.remove(id);
  }
}