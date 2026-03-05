/**
 * Type Guard kiểm tra xem một field (Reference) đã được populate dữ liệu chưa.
 * Dùng để thay thế việc ép kiểu thủ công 'as unknown as ...'
 */

// Định nghĩa cơ bản cho một document MongoDB có _id hoặc id
interface BaseEntity {
  _id?: string | any;
  id?: string;
}

/**
 * Kiểm tra: Biến này có phải là Document (Object) không?
 * Nếu trả về true: TypeScript sẽ hiểu biến này có kiểu T
 */
export function isPopulated<T extends BaseEntity>(
  doc: string | T | any | null | undefined,
): doc is T {
  return (
    doc !== null &&
    doc !== undefined &&
    typeof doc === "object" &&
    ("_id" in doc || "id" in doc)
  );
}

/**
 * Kiểm tra: Biến này có phải là ID (String/ObjectId) không?
 * Dùng cho các logic chỉ cần ID
 */
export function isReferenceId(
  doc: string | any | null | undefined,
): doc is string {
  if (!doc) return false;
  // Kiểm tra string hoặc ObjectId object (có hàm toHexString/toString nhưng ko có các field khác)
  if (typeof doc === "string") return true;
  if (
    typeof doc === "object" &&
    doc.constructor.name === "ObjectId" // Mongo ObjectId check
  ) {
    return true;
  }
  return false;
}
