// import { HttpService } from '@nestjs/axios';
// import {
//   BadRequestException,
//   Injectable,
//   InternalServerErrorException,
//   Logger,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { GeoPoint, RouteInfoResponse } from '@obtp/shared-types';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class MapsService {
//   private readonly logger = new Logger(MapsService.name);
//   private readonly OSRM_BASE_URL = 'http://router.project-osrm.org';

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {
//     // Có thể override URL từ config nếu deploy server OSRM riêng
//     const configUrl = this.configService.get<string>('OSRM_API_URL');
//     if (configUrl) {
//       this.OSRM_BASE_URL = configUrl;
//     }
//   }

//   async getRouteInfo(waypoints: GeoPoint[]): Promise<RouteInfoResponse> {
//     if (!waypoints || waypoints.length < 2) {
//       throw new BadRequestException('Cần ít nhất 2 tọa độ để tạo tuyến đường.');
//     }

//     // OSRM Format: {longitude},{latitude};{longitude},{latitude}
//     const coordsString = waypoints.map((c) => `${c.lng},${c.lat}`).join(';');

//     // API Options: full geometry (polyline), get duration & distance
//     const url = `${this.OSRM_BASE_URL}/route/v1/driving/${coordsString}?overview=full&geometries=polyline&annotations=duration,distance`;

//     this.logger.log(`Calling OSRM: ${url}`);

//     try {
//       const response = await firstValueFrom(this.httpService.get(url));

//       // OSRM Response Structure handling (Duck typing check)
//       const data = response.data;
//       if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
//         this.logger.error('OSRM API Error or Empty Route', data);
//         throw new InternalServerErrorException(
//           'Không tìm thấy tuyến đường hợp lệ.',
//         );
//       }

//       const route = data.routes[0];

//       // Logic cũ: Có multiplier điều chỉnh thời gian thực tế
//       const durationMultiplier = this.configService.get<number>(
//         'ROUTE_DURATION_MULTIPLIER',
//         1.0,
//       );
//       const adjustedDuration = Math.round(route.duration * durationMultiplier);

//       return {
//         polyline: route.geometry,
//         distance: route.distance, // Mét
//         duration: adjustedDuration, // Giây
//       };
//     } catch (error) {
//       // Error Parsing (Standardizing external API error)
//       const msg =
//         error?.response?.data?.message ||
//         error.message ||
//         'Lỗi kết nối Map Service';
//       this.logger.error('Map Service Failed:', msg);

//       throw new InternalServerErrorException(`Không thể tính lộ trình: ${msg}`);
//     }
//   }
// }
