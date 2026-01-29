import {
  SeatMapLayout,
  SeatStatus,
  TripSeat,
  Vehicle,
} from "@obtp/shared-types";

/**
 * Khởi tạo danh sách ghế cho chuyến đi dựa trên xe
 */
export function initializeTripSeats(vehicle: Partial<Vehicle>): TripSeat[] {
  const generatedSeats: TripSeat[] = [];

  // Helper duyệt qua Layout ma trận và flatten nó
  const processLayout = (layout?: SeatMapLayout) => {
    if (!layout) return;

    layout.forEach((row) => {
      if (Array.isArray(row)) {
        row.forEach((seatLabel) => {
          // Chỉ lấy các cell có nhãn (không lấy null/lối đi)
          if (seatLabel) {
            generatedSeats.push({
              seatNumber: seatLabel,
              status: SeatStatus.AVAILABLE,
            });
          }
        });
      }
    });
  };

  // Tầng 1
  if (vehicle.seatMap) {
    processLayout(vehicle.seatMap.layout);
  }

  // Tầng 2
  if (vehicle.floors && vehicle.floors > 1 && vehicle.seatMapFloor2) {
    processLayout(vehicle.seatMapFloor2.layout);
  }

  // Fallback: Nếu xe không có map (data cũ) nhưng có totalSeats
  // Sinh ghế ảo G1, G2...
  if (
    generatedSeats.length === 0 &&
    vehicle.totalSeats &&
    vehicle.totalSeats > 0
  ) {
    for (let i = 1; i <= vehicle.totalSeats; i++) {
      generatedSeats.push({
        seatNumber: `G${i}`,
        status: SeatStatus.AVAILABLE,
      });
    }
  }

  return generatedSeats;
}

/**
 * Validate tính hợp lệ của thời gian
 */
export function isValidTripTime(depart: Date, arrive: Date): boolean {
  return depart.getTime() < arrive.getTime();
}
