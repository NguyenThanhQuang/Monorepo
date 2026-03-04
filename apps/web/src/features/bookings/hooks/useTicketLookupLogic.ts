import { bookingsApi } from "@obtp/api-client";
import type { Booking } from "@obtp/shared-types";
import { useState } from "react";
import toast from "react-hot-toast";

export function useTicketLookupLogic() {
  const [ticketCode, setTicketCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketCode || !phoneNumber) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const data = await bookingsApi.lookup({
        identifier: ticketCode,
        contactPhone: phoneNumber,
      });

      setResult(data as any);
      toast.success("Tra cứu thành công!");
    } catch (err: any) {
      console.error("Lookup Error:", err);
      const msg =
        err.response?.data?.message ||
        "Không tìm thấy thông tin vé hoặc số điện thoại không khớp";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    ticketCode,
    setTicketCode,
    phoneNumber,
    setPhoneNumber,
    loading,
    result,
    error,
    handleSearch,
  };
}
