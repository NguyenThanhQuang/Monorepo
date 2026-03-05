/**
 * Logic Module: Location
 * Chứa các pure functions xử lý dữ liệu địa điểm.
 */
import slugify from "slugify";

// Logic tạo slug (Code cũ dùng trong pre-save hook)
export function generateLocationSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}

// Logic tạo Regex search an toàn (Code cũ: escapeRegex trong Service)
export function createSafeSearchRegex(keyword: string): RegExp | null {
  if (!keyword || keyword.trim().length < 2) return null;

  const decoded = decodeURIComponent(keyword);
  const escaped = decoded.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  return new RegExp(escaped, "i");
}

// Utility: Format lại Coordinates từ query string (nếu cần xử lý query geo search sau này)
export function parseCoordinates(
  lat?: string,
  lon?: string,
): [number, number] | null {
  const latitude = parseFloat(lat || "");
  const longitude = parseFloat(lon || "");

  if (isNaN(latitude) || isNaN(longitude)) return null;
  return [longitude, latitude];
}
