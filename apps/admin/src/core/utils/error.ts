import type { ApiErrorResponse } from "@obtp/shared-types";
import { AxiosError } from "axios";

/**
 * Trích xuất message lỗi an toàn từ Axios Error
 * Không còn cần dùng `err: any` ở các file UI nữa.
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = "Đã có lỗi xảy ra",
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.message && Array.isArray(data.message)) {
      return data.message.map((m) => m.message || m.field).join(", ");
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
