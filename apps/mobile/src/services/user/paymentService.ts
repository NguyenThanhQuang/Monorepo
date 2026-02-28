import apiService from "../common/apiService";

// Backend trả envelope: { statusCode, message, data }
const unwrap = (resData: any) => resData?.data ?? resData;

export type PaymentLink = {
  checkoutUrl: string;
  orderCode: number;
  qrCode?: string;
};

// Kết quả sync (backend có thể trả {ok,status,...})
export type PaymentSyncResult = {
  ok?: boolean;
  status?: string; // "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" | ...
  message?: string;
};

class PaymentService {
  async createPaymentLink(bookingId: string): Promise<PaymentLink> {
    const res = await apiService.post<any>("/payments/create-link", {
      bookingId,
    });
    return unwrap(res.data);
  }

  // ✅ THÊM HÀM NÀY
  async syncPayment(bookingId: string): Promise<PaymentSyncResult> {
    const res = await apiService.post<any>("/payments/sync", { bookingId });
    return unwrap(res.data);
  }

  async devConfirmPayment(bookingId: string) {
    const res = await apiService.post<any>("/payments/dev-confirm", {
      bookingId,
    });
    return unwrap(res.data);
  }
}

export const paymentService = new PaymentService();
