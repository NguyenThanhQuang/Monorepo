import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as sharedTypes from '@obtp/shared-types';

import {
  CreateGuestReviewSchema,
  CreateReviewSchema,
  ReviewQuerySchema,
  UpdateUserReviewSchema,
  UpdateVisibilitySchema,
} from '@obtp/validation';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // PUBLIC LIST
  @Get()
  @UsePipes(new ZodValidationPipe(ReviewQuerySchema))
  findAll(@Query() query: sharedTypes.ReviewQuery) {
    return this.reviewsService.findAllPublic(query);
  }

  // AUTH USER CREATE
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  create(
    @Body() payload: sharedTypes.CreateReviewPayload,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.reviewsService.create(payload, user);
  }

  // GUEST CREATE
  @Post('guest')
  @UsePipes(new ZodValidationPipe(CreateGuestReviewSchema))
  createAsGuest(@Body() payload: sharedTypes.CreateGuestReviewPayload) {
    return this.reviewsService.createAsGuest(payload);
  }

  // USER UPDATE SELF
  @Patch(':id/my-review')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UpdateUserReviewSchema))
  updateMyReview(
    @Param('id') id: string,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Body() payload: sharedTypes.UpdateUserReviewPayload,
  ) {
    return this.reviewsService.updateReview(id, user, payload);
  }

  // ADMIN SECTION
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  findAllForAdmin(@Query() query: sharedTypes.ReviewQuery) {
    return this.reviewsService.findAllForAdmin(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateVisibilitySchema))
  updateVisibility(
    @Param('id') id: string,
    @Body() body: { isVisible: boolean },
  ) {
    return this.reviewsService.toggleVisibility(id, body.isVisible);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
