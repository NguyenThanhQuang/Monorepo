import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ): Promise<sharedTypes.SanitizedUserResponse> {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }
    return this.usersService.sanitizeUser(fullUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateMyProfile(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.UpdateUserPayload,
  ) {
    return this.usersService.updateProfile(user.id, payload);
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  @Get('admin/all')
  async getAllUsersForAdmin() {
    return this.usersService.findAllForAdmin();
  }

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

  // Lấy vé của tôi
  @Get('me/bookings')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.usersService.findUserBookings(user.id);
  }

  // Xem Profile người khác (Cho Admin hoặc xem chính mình qua ID)
  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserProfile(
    @Param('userId') targetUserId: string,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    const isAdmin = user.roles.includes(sharedTypes.UserRole.ADMIN);
    const isOwner = user.id === targetUserId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin này.');
    }

    const fullUser = await this.usersService.findById(targetUserId);
    if (!fullUser) throw new NotFoundException('Người dùng không tồn tại.');

    return this.usersService.sanitizeUser(fullUser);
  }
}
