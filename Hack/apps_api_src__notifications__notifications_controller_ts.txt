import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as sharedTypes from '@obtp/shared-types';
import { NotificationsRestService } from './notifications.rest.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly rest: NotificationsRestService) {}

  @Get()
  list(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.rest.list(user.id, Number(page), Number(limit));
  }

  @Put(':id/read')
  markRead(@CurrentUser() user: sharedTypes.AuthUserResponse, @Param('id') id: string) {
    return this.rest.markRead(user.id, id);
  }

  @Put('read-all')
  markAllRead(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.rest.markAllRead(user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: sharedTypes.AuthUserResponse, @Param('id') id: string) {
    return this.rest.remove(user.id, id);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.rest.unreadCount(user.id);
  }

  @Get('settings')
  getSettings(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.rest.getSettings(user.id);
  }

  @Put('settings')
  updateSettings(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: any,
  ) {
    return this.rest.updateSettings(user.id, payload);
  }
}
