/**
 * Định nghĩa Cấu hình hằng số cho thuật toán tính lịch trình
 */
export const SCHEDULE_CONFIG = {
  STOP_WAITING_TIME_MINUTES: 20, // Thời gian chờ mặc định tại mỗi trạm (phút)
};

/**
 * Kiểu dữ liệu trả về sau khi tính toán
 */
export interface ScheduleCalculationResult {
  expectedArrivalTime: Date; // Thời gian đến đích cuối cùng
  stops: {
    expectedArrivalTime: Date; // Giờ đến trạm
    expectedDepartureTime: Date; // Giờ đi khỏi trạm
  }[];
}

/**
 * Thuật toán cộng dồn thời gian (Cascade Time Calculation)
 *
 * @param departureTime Giờ khởi hành gốc (Điểm đi)
 * @param legDurationsInSeconds Mảng thời gian (giây) của từng chặng nối tiếp. Ví dụ: [Đi->Trạm1, Trạm1->Trạm2, Trạm2->Đến]
 * @returns Object chứa mốc thời gian đã tính toán cho tất cả các điểm
 */
export function calculateScheduleTimestamps(
  departureTime: Date | string,
  legDurationsInSeconds: number[],
): ScheduleCalculationResult {
  const startTime = new Date(departureTime);
  if (isNaN(startTime.getTime())) {
    throw new Error("Thời gian khởi hành không hợp lệ");
  }

  let currentTimeMs = startTime.getTime();

  const stopsResult: {
    expectedArrivalTime: Date;
    expectedDepartureTime: Date;
  }[] = [];

  for (let i = 0; i < legDurationsInSeconds.length; i++) {
    const durationSeconds = legDurationsInSeconds[i] || 0;

    currentTimeMs += durationSeconds * 1000;
    const arrivalTimeAtNode = new Date(currentTimeMs);

    if (i < legDurationsInSeconds.length - 1) {
      currentTimeMs += SCHEDULE_CONFIG.STOP_WAITING_TIME_MINUTES * 60 * 1000;
      const departureTimeFromNode = new Date(currentTimeMs);

      stopsResult.push({
        expectedArrivalTime: arrivalTimeAtNode,
        expectedDepartureTime: departureTimeFromNode,
      });
    } else {
      return {
        expectedArrivalTime: arrivalTimeAtNode,
        stops: stopsResult,
      };
    }
  }

  return {
    expectedArrivalTime: new Date(currentTimeMs),
    stops: stopsResult,
  };
}
