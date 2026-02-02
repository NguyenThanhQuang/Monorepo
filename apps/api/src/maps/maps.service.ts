import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoPoint, RouteInfoResponse } from '@obtp/shared-types';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly OSRM_BASE_URL: string = 'http://router.project-osrm.org';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const configUrl = this.configService.get<string>('OSRM_API_URL');
    if (configUrl) {
      this.OSRM_BASE_URL = configUrl;
    }
  }

  async getRouteInfo(waypoints: GeoPoint[]): Promise<RouteInfoResponse> {
    if (!waypoints || waypoints.length < 2) {
      throw new BadRequestException('Cần ít nhất 2 tọa độ để tạo tuyến đường.');
    }

    const coordsString = waypoints.map((c) => `${c.lng},${c.lat}`).join(';');
    const url = `${this.OSRM_BASE_URL}/route/v1/driving/${coordsString}?overview=full&geometries=polyline&annotations=duration,distance`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        this.logger.error('OSRM API Error or Empty Route', data);
        throw new InternalServerErrorException(
          'Không tìm thấy tuyến đường hợp lệ.',
        );
      }

      const route = data.routes[0];
      const durationMultiplier = this.configService.get<number>(
        'ROUTE_DURATION_MULTIPLIER',
        1.0,
      );

      return {
        polyline: route.geometry,
        distance: route.distance,
        duration: Math.round(route.duration * durationMultiplier),
      };
    } catch (error) {
      let errorMessage = 'Lỗi kết nối Map Service';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      this.logger.error('Map Service Failed:', errorMessage);
      throw new InternalServerErrorException(
        `Không thể tính lộ trình: ${errorMessage}`,
      );
    }
  }
}
