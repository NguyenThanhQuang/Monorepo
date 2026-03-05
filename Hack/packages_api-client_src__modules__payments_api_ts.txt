import {
  CreatePaymentLinkPayload,
  PaymentLinkResponse, // Giả sử shared-types có Type này, hoặc là any
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const paymentsApi = {
  // Tạo link thanh toán từ BookingId
  createPaymentLink: (payload: CreatePaymentLinkPayload) => {
    return http.post<PaymentLinkResponse>("/payments/create-link", payload);
  },

  // Webhook endpoint thường do PayOS Server gọi vào Backend trực tiếp,
  // Client Frontend hiếm khi gọi webhook endpoint.
};
