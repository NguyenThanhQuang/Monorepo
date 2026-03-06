import type { SeatMap, SeatMapLayout } from "@obtp/shared-types";

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
  aisles: number[],
  seatPrefix: string,
  fullRows: number[] = [],
): GeneratedSeatMapResult {
  if (rows <= 0 || columns <= 0)
    throw new Error("Số hàng và số cột phải lớn hơn 0.");

  let seatCount = 0;
  const layout: SeatMapLayout = [];

  for (let r = 1; r <= rows; r++) {
    const newRow: (string | null)[] = [];
    const isFullRow = fullRows.includes(r);

    for (let c = 1; c <= columns; c++) {
      if (!isFullRow && aisles.includes(c)) {
        newRow.push(null);
      } else {
        seatCount++;
        const seatNumber = `${seatPrefix}${seatCount.toString().padStart(2, "0")}`;
        newRow.push(seatNumber);
      }
    }
    layout.push(newRow);
  }

  return { seatCount, seatMap: { rows, cols: columns, layout } };
}

/**
 * Hàm tính tổng hợp cho cả xe (bao gồm Logic 2 tầng)
 */
export function calculateVehicleConfig(
  rows: number,
  cols: number,
  aisles: number[],
  floors: number,
  fullRows: number[] = [],
): {
  totalSeats: number;
  seatMapFloor1: SeatMap;
  seatMapFloor2?: SeatMap;
} {
  const f1 = generateSeatMapLayout(rows, cols, aisles, "A", fullRows);
  let totalSeats = f1.seatCount;
  let seatMapFloor2: SeatMap | undefined = undefined;

  if (floors > 1) {
    const f2 = generateSeatMapLayout(rows, cols, aisles, "B", fullRows);
    totalSeats += f2.seatCount;
    seatMapFloor2 = f2.seatMap;
  }

  return {
    totalSeats,
    seatMapFloor1: f1.seatMap,
    seatMapFloor2,
  };
}
