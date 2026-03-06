import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Chấp nhận điều khoản",
      content:
        "Khi sử dụng nền tảng OBTP để đặt vé xe, bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện được nêu tại đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.",
    },
    {
      title: "2. Quy định đặt vé và thanh toán",
      content:
        "Vé chỉ được xác nhận khi thanh toán thành công 100% giá trị. Hệ thống sử dụng cổng thanh toán PayOS. Thời gian giữ chỗ tiêu chuẩn là 15 phút, quá thời gian này giao dịch sẽ bị hủy tự động.",
    },
    {
      title: "3. Chính sách hủy và hoàn tiền",
      content:
        "Việc hủy vé phụ thuộc vào chính sách của từng nhà xe cụ thể. OBTP hỗ trợ hủy vé trực tuyến và hoàn tiền vào tài khoản gốc theo đúng quy định hoàn hủy đã được công bố lúc đặt vé.",
    },
    {
      title: "4. Trách nhiệm của khách hàng",
      content:
        "Khách hàng cần cung cấp thông tin chính xác khi đặt vé. Phải có mặt tại điểm đón trước 30 phút. OBTP không chịu trách nhiệm nếu khách hàng lỡ chuyến do cung cấp sai thông tin hoặc đến muộn.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Điều khoản sử dụng
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cập nhật lần cuối: 07/03/2026
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
          {sections.map((sec, index) => (
            <div key={index} className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-teal-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {sec.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
