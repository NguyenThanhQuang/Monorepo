import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Chính sách bảo mật
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cam kết bảo vệ dữ liệu cá nhân của bạn
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 prose dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 rounded-xl">
            <Lock className="w-6 h-6 shrink-0" />
            <p className="m-0 font-medium">
              OBTP tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu. Thông
              tin của bạn được mã hóa bằng chuẩn an toàn cao nhất.
            </p>
          </div>

          <h3>1. Thông tin chúng tôi thu thập</h3>
          <p>
            Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc đặt
            vé bao gồm: Họ tên, Số điện thoại, Email và Lịch sử chuyến đi.
          </p>

          <h3>2. Mục đích sử dụng</h3>
          <ul>
            <li>Xác nhận thông tin đặt vé và thanh toán.</li>
            <li>Gửi vé điện tử qua Email.</li>
            <li>Nhà xe đối tác liên hệ xác nhận điểm đón/trả.</li>
            <li>Cải thiện chất lượng dịch vụ thông qua lịch sử đánh giá.</li>
          </ul>

          <h3>3. Chia sẻ dữ liệu</h3>
          <p>
            Chúng tôi <strong>không bao giờ bán</strong> dữ liệu cá nhân của
            bạn. Thông tin (Tên, SĐT) chỉ được chia sẻ duy nhất cho{" "}
            <strong>Nhà xe</strong> cung cấp chuyến đi mà bạn đã đặt để phục vụ
            việc đón trả khách.
          </p>
        </div>
      </div>
    </div>
  );
}
