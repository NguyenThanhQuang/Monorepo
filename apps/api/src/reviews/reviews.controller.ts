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
import {
  CreateDriverReviewSchemaLocal,
  CreateGuestReviewSchema,
  CreateReviewSchema,
  DriverReviewsQuerySchemaLocal,
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

  @Get()
  @UsePipes(new ZodValidationPipe(ReviewQuerySchema))
  findAll(@Query() query: sharedTypes.ReviewQuery) {
    return this.reviewsService.findAllPublic(query);
  }
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyReviews(@CurrentUser() user: sharedTypes.AuthUserResponse) {
    return this.reviewsService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  create(
    @Body() payload: sharedTypes.CreateReviewPayload,
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.reviewsService.create(payload, user);
  }

  @Post('guest')
  @UsePipes(new ZodValidationPipe(CreateGuestReviewSchema))
  createAsGuest(@Body() payload: sharedTypes.CreateGuestReviewPayload) {
    return this.reviewsService.createAsGuest(payload);
  }

  @Post('driver')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateDriverReviewSchemaLocal))
  createDriverReview(
    @Body()
    payload: {
      bookingId: string;
      rating: number;
      comment?: string;
      isAnonymous?: boolean;
    },
    @CurrentUser() user: sharedTypes.AuthUserResponse,
  ) {
    return this.reviewsService.createDriverReview(payload, user);
  }

  @Get('driver')
  @UsePipes(new ZodValidationPipe(DriverReviewsQuerySchemaLocal))
  getDriverReviews(
    @Query()
    query: {
      driverId: string;
      limit?: number;
      skip?: number;
    },
  ) {
    return this.reviewsService.getDriverReviews(query.driverId, {
      limit: query.limit,
      skip: query.skip,
    });
  }

  @Get('driver/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    (sharedTypes.UserRole as any).DRIVER ?? ('driver' as any),
    sharedTypes.UserRole.COMPANY_ADMIN,
    sharedTypes.UserRole.ADMIN,
  )
  getMyDriverReviews(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.reviewsService.getMyDriverReviews(user, {
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      includeHidden: false,
    });
  }

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

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN)
  findCompanyReviews(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query() query: sharedTypes.ReviewQuery,
  ) {
    if (user.roles.includes(sharedTypes.UserRole.COMPANY_ADMIN)) {
      query.companyId = user.companyId;
    }
    return this.reviewsService.findAllForAdmin(query);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(sharedTypes.UserRole.COMPANY_ADMIN, sharedTypes.UserRole.ADMIN)
  findAllForCompany(
    @CurrentUser() user: sharedTypes.AuthUserResponse,
    @Query() query: sharedTypes.ReviewQuery,
  ) {
    if (!user.companyId)
      throw new ForbiddenException('Tài khoản chưa liên kết nhà xe.');

    return this.reviewsService.findAllForAdmin({
      ...query,
      companyId: user.companyId,
    });
  }
}
