// Hàm hỗ trợ build URL verify (pure logic)
export function constructVerificationUrl(
  baseUrl: string,
  path: string,
  success: boolean,
  messageKey: string,
  accessToken?: string,
): string {
  // Đảm bảo không bị double slash khi join
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${cleanBase}${cleanPath}`);
  url.searchParams.set("success", String(success));
  url.searchParams.set("message", messageKey);

  if (success && accessToken) {
    url.searchParams.set("accessToken", accessToken);
  }
  return url.toString();
}

// Logic đệ quy transform _id -> id
export function transformMongoId(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformMongoId(item));
  }

  // Handle Mongoose Types without importing Mongoose directly (Duck typing)
  if (
    data &&
    typeof data.toString === "function" &&
    /^[0-9a-fA-F]{24}$/.test(data.toString()) &&
    !data.substring
  ) {
    // ObjectId typically matches regex and isn't a string literal with substring method
    // Or simplified check if it's strictly a plain object loop later
    return data.toString();
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "object") {
    // If has toObject (mongoose doc), call it first
    const obj = typeof data.toObject === "function" ? data.toObject() : data;
    const newData: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === "_id") {
          newData["id"] = obj[key].toString();
        } else if (key === "__v") {
          continue;
        } else {
          newData[key] = transformMongoId(obj[key]);
        }
      }
    }
    return newData;
  }

  return data;
}
