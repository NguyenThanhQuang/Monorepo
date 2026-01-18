/**
 * [LOGIC] Pure Function đệ quy để chuẩn hóa dữ liệu output:
 * 1. Chuyển _id thành id (string).
 * 2. Loại bỏ __v.
 * 3. Xử lý Date.
 * 4. Không xử lý trực tiếp Mongoose Document (cần convert toObject bên ngoài).
 */
export function normalizeResponseData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => normalizeResponseData(item));
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "object") {
    // Clone object để tránh mutate input reference
    const newData: Record<string, unknown> = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = (data as Record<string, unknown>)[key];

        // Transformation Logic
        if (key === "_id") {
          // Ép về string cho id (chấp nhận cả Object như ObjectId nếu nó có toString)
          newData["id"] = String(value);
        } else if (key === "__v") {
          continue; // Bỏ qua version key
        } else {
          newData[key] = normalizeResponseData(value); // Đệ quy
        }
      }
    }
    return newData;
  }

  return data;
}
