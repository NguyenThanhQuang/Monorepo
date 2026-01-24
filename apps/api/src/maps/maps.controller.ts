// import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';

// import * as sharedTypes from '@obtp/shared-types';

// import { CalculateRouteSchema } from '@obtp/validation';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
// import { MapsService } from './maps.service';

// @Controller('maps')
// export class MapsController {
//   constructor(private readonly mapsService: MapsService) {}

//   @Post('calculate-route')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(sharedTypes.UserRole.ADMIN, sharedTypes.UserRole.COMPANY_ADMIN) // Chỉ cho admin dùng tool này
//   @UsePipes(new ZodValidationPipe(CalculateRouteSchema))
//   async calculateRoute(@Body() payload: sharedTypes.CalculateRoutePayload) {
//     return this.mapsService.getRouteInfo(payload.waypoints);
//   }
// }
