import { CalculateRoutePayload, RouteInfoResponse } from "@obtp/shared-types";
import { http } from "../core/http-client";

export const mapsApi = {
  calculateRoute: (payload: CalculateRoutePayload) => {
    return http.post<RouteInfoResponse>("/maps/calculate-route", payload);
  },
};
