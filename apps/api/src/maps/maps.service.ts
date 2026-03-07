import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoPoint, RouteInfoResponse } from '@obtp/shared-types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly OSRM_BASE_URL: string = 'http://router.project-osrm.org';

  private readonly FALLBACK_SPEED_KMH = 50; // Vận tốc trung bình giả định
  private readonly ROAD_CURVATURE_FACTOR = 1.3; // Hệ số đường vòng vèo

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


    try {
      const coordsString = waypoints.map((c) => `${c.lng},${c.lat}`).join(';');      const url = `${this.OSRM_BASE_URL}/route/v1/driving/${coordsString}?overview=full&geometries=polyline&annotations=duration,distance`;

      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMultiplier = this.configService.get<number>(
          'ROUTE_DURATION_MULTIPLIER',
          1.0,
        );

        const legDurations =
          route.legs && Array.isArray(route.legs)
            ? route.legs.map((leg: any) =>
                Math.round(leg.duration * durationMultiplier),
              )
            : [];

        return {
          polyline: route.geometry,
          distance: route.distance,
          duration: Math.round(route.duration * durationMultiplier),
          legDurations,
        };
      }

      throw new Error(`OSRM Error: ${data.code}`);
    } catch (error) {
      this.logger.warn(
        `Map Service Fallback triggered. Reason: ${error instanceof Error ? error.message : String(error)}`,
      );

      return this.calculateFallbackRoute(waypoints);
    }
  }

  /**
   * Tính toán dự phòng bằng công thức Haversine
   * (Dùng khi không tìm được đường bộ, vd: ra đảo hoặc server lỗi)
   */
  private calculateFallbackRoute(waypoints: GeoPoint[]): RouteInfoResponse {
    let totalDistanceMeters = 0;
    const legDurations: number[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      const distMeters = this.getHaversineDistance(p1, p2);

      const estimatedRoadDistance = distMeters * this.ROAD_CURVATURE_FACTOR;

      const speedMps = (this.FALLBACK_SPEED_KMH * 1000) / 3600;
      const durationSeconds = Math.round(estimatedRoadDistance / speedMps);

      totalDistanceMeters += estimatedRoadDistance;
      legDurations.push(durationSeconds);
    }

    return {
      polyline: '',
      distance: Math.round(totalDistanceMeters),
      duration: legDurations.reduce((a, b) => a + b, 0),
      legDurations,
    };
  }

  /**
   * Công thức Haversine tính khoảng cách giữa 2 điểm tọa độ (trả về mét)
   */
  private getHaversineDistance(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371e3;
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
