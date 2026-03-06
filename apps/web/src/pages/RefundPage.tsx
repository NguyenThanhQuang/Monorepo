import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw, AlertTriangle } from "lucide-react";

export function RefundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl mb-6">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Chính sách hoàn & hủy vé
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Các quy định áp dụng khi thay đổi lịch trình
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 prose dark:prose-invert max-w-none">
          <div className="flex items-start gap-3 mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-xl border border-orange-200 dark:border-orange-800/50">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="m-0 text-sm md:text-base leading-relaxed">
              <strong>Lưu ý quan trọng:</strong> Mỗi nhà xe có thể áp dụng tỷ lệ
              phí hủy khác nhau dựa trên thời điểm bạn gửi yêu cầu hủy vé so với
              giờ khởi hành. Hãy kiểm tra kỹ điều kiện vé trước khi đặt.
            </p>
          </div>

          <h3>1. Quy định hủy vé chung</h3>
          <ul>
            <li>
              <strong>Trước 24 tiếng</strong> so với giờ khởi hành: Hỗ trợ hoàn
              100% tiền vé (trừ phí giao dịch cổng thanh toán nếu có).
            </li>
            <li>
              <strong>Từ 12 đến 24 tiếng</strong> so với giờ khởi hành: Thu phí
              hủy vé 30% - 50% tùy thuộc vào nhà xe.
            </li>
            <li>
              <strong>Dưới 12 tiếng</strong> so với giờ khởi hành: Không hỗ trợ
              hoàn/hủy vé.
            </li>
          </ul>

          <h3>2. Quy định dịp Lễ, Tết</h3>
          <p>
            Vé mua vào các dịp Lễ, Tết (do nhà nước quy định) thường{" "}
            <strong>không được phép hoàn/hủy/đổi chuyến</strong>. Trừ trường hợp
            nhà xe thay đổi chính sách linh động, chúng tôi sẽ thông báo trực
            tiếp lúc bạn đặt vé.
          </p>

          <h3>3. Thời gian và phương thức hoàn tiền</h3>
          <p>
            Nếu yêu cầu hủy vé của bạn được chấp thuận, tiền sẽ được hoàn trả về
            đúng tài khoản hoặc ví điện tử bạn đã sử dụng để thanh toán ban đầu.
          </p>
          <ul>
            <li>
              <strong>Ví điện tử (MoMo, ZaloPay):</strong> Tiền vào tài khoản
              trong vòng 1-3 ngày làm việc.
            </li>
            <li>
              <strong>Thẻ ATM nội địa/Chuyển khoản:</strong> Tiền vào tài khoản
              trong vòng 3-5 ngày làm việc.
            </li>
            <li>
              <strong>Thẻ tín dụng (Visa/Mastercard):</strong> Tùy thuộc vào
              ngân hàng phát hành thẻ, thời gian nhận tiền từ 7-15 ngày làm
              việc.
            </li>
          </ul>

          <h3>4. Cách thức yêu cầu hủy vé</h3>
          <p>
            Khách hàng có thể chủ động hủy vé tại mục{" "}
            <strong>"Chuyến đi của tôi"</strong> nếu đã đăng nhập, hoặc liên hệ
            trực tiếp Tổng đài hỗ trợ: <strong>1900 6067</strong> cung cấp Mã vé
            và Số điện thoại để nhân viên hỗ trợ thao tác hủy.
          </p>
        </div>
      </div>
    </div>
  );
}
