import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';

import {
  ChangePasswordSchema,
  UpdateUserSchema,
  UpdateUserStatusSchema,
} from '@obtp/validation';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Get Me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ): Promise<sharedTypes.SanitizedUserResponse> {
    const fullUser = await this.usersService.findById(user.id);
    // @ts-expect-error FullUser could be null, handled by guards/service
    return this.usersService.sanitizeUser(fullUser);
  }

  // 2. Update Profile
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateMyProfile(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.UpdateUserPayload,
  ) {
    return this.usersService.updateProfile(user.id, payload);
  }

  // 3. Change Password
  @UseGuards(JwtAuthGuard)
  @Patch('me/change-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
  async changeMyPassword(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.ChangePasswordPayload,
  ) {
    return this.usersService.changePassword(user.id, payload);
  }

  // 4. Admin - Get All
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  @Get('admin/all')
  async getAllUsersForAdmin() {
    return this.usersService.findAllForAdmin();
  }

  // 5. Admin - Ban User
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  @Patch('admin/:userId/status')
  @UsePipes(new ZodValidationPipe(UpdateUserStatusSchema))
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() payload: sharedTypes.UpdateUserStatusPayload,
  ) {
    // Zod pipe hoặc Global Pipe phải đảm bảo validate userId là MongoId
    // Tạm thời tin tưởng Pipe global đã setup
    return this.usersService.updateUserStatus(userId, payload.isBanned);
  }
}
