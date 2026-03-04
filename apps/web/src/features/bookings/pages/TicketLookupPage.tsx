import { useState } from "react";
import { Ticket, MapPin, Clock, User, CreditCard, Search, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@obtp/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export function TicketLookupPage() {
  const { t } = useLanguage();

  const [ticketCode, setTicketCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketCode || !phoneNumber) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const data = await bookingsApi.lookup({
        identifier: ticketCode,
        contactPhone: phoneNumber,
      });

      setResult(data);
      toast.success("Tra cứu thành công!");
    } catch (err: any) {
      console.error("Lookup Error:", err);
      const msg =
        err.response?.data?.message ||
        "Không tìm thấy thông tin vé hoặc số điện thoại không khớp";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";
  const formatDate = (date: string) => new Date(date).toLocaleString("vi-VN");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("ticketLookupTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("ticketLookupSubtitle")}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("ticketCode")}
                </label>
                <div className="relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder={t("ticketCodePlaceholder")}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("phoneNumber")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t("phoneNumberPlaceholder")}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{t("loading")}</span>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {t("lookupButton")}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-blue-100 dark:border-blue-900/30 animate-scale-in">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("bookingCode")}
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.ticketCode}
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  result.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : result.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {result.status === "confirmed"
                  ? "Đã thanh toán"
                  : result.status === "cancelled"
                    ? "Đã hủy"
                    : result.status === "held"
                      ? "Đang giữ chỗ"
                      : result.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  {t("tripInformation")}
                </h3>

                <div className="pl-7 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">{t("route")}</div>
                    <div className="font-medium">
                      {result.tripId?.route?.fromLocationId?.name} →{" "}
                      {result.tripId?.route?.toLocationId?.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">{t("time")}</div>
                    <div className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(result.tripId?.departureTime)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      {t("busCompany")}
                    </div>
                    <div className="font-medium">
                      {result.tripId?.companyId?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-500" />
                  {t("passengerInformation")}
                </h3>

                <div className="pl-7 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      {t("passenger")}
                    </div>
                    <div className="font-medium">{result.contactName}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      {t("phoneNumber")}
                    </div>
                    <div className="font-medium">{result.contactPhone}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      {t("seatAndPrice")}
                    </div>
                    <div className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {formatCurrency(result.totalAmount)}
                      <span className="text-gray-400 text-sm font-normal">
                        ({result.passengers?.length || 0} ghế:{" "}
                        {result.passengers
                          ?.map((p: any) => p.seatNumber)
                          .join(", ")}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
