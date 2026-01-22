import { SeatMap, SeatMapLayout } from "@obtp/shared-types";

export interface GeneratedSeatMapResult {
  seatCount: number;
  seatMap: SeatMap;
}

/**
 * Thuật toán sinh sơ đồ ghế
 */
export function generateSeatMapLayout(
  rows: number,
  columns: number,
  aisles: number[], // Mảng vị trí cột là lối đi (start from 1)
  seatPrefix: string, // 'A' hoặc 'B'
): GeneratedSeatMapResult {
  // Guard Clauses basic
  if (rows <= 0 || columns <= 0) {
    // Thay vì throw Exception của NestJS, ta throw Error JS thuần để Logic độc lập
    throw new Error("Số hàng và số cột phải lớn hơn 0.");
  }

  let seatCount = 0;
  const layout: SeatMapLayout = [];

  for (let r = 1; r <= rows; r++) {
    const newRow: (string | null)[] = [];
    for (let c = 1; c <= columns; c++) {
      if (aisles.includes(c)) {
        // Đây là lối đi
        newRow.push(null);
      } else {
        // Đây là ghế
        seatCount++;
        // Format: Prefix + Number (pad 0) => A01, A02...
        const seatNumber = `${seatPrefix}${seatCount.toString().padStart(2, "0")}`;
        newRow.push(seatNumber);
      }
    }
    layout.push(newRow);
  }

  return {
    seatCount,
    seatMap: {
      rows,
      cols: columns,
      layout,
    },
  };
}

/**
 * Hàm tính tổng hợp cho cả xe (bao gồm Logic 2 tầng)
 */
export function calculateVehicleConfig(
  rows: number,
  cols: number,
  aisles: number[],
  floors: number,
): {
  totalSeats: number;
  seatMapFloor1: SeatMap;
  seatMapFloor2?: SeatMap;
} {
  // Generate Floor 1 (Prefix A)
  const f1 = generateSeatMapLayout(rows, cols, aisles, "A");
  let totalSeats = f1.seatCount;
  let seatMapFloor2: SeatMap | undefined = undefined;

  // Generate Floor 2 (Prefix B) if needed
  if (floors > 1) {
    const f2 = generateSeatMapLayout(rows, cols, aisles, "B");
    totalSeats += f2.seatCount;
    seatMapFloor2 = f2.seatMap;
  }

  return {
    totalSeats,
    seatMapFloor1: f1.seatMap,
    seatMapFloor2,
  };
}
