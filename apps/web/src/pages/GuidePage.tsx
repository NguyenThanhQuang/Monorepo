import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CheckSquare,
  CreditCard,
  Mail,
  Ticket,
} from "lucide-react";

export function GuidePage() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Search className="w-8 h-8 text-blue-500" />,
      title: "Bước 1: Tìm kiếm chuyến xe",
      desc: "Tại trang chủ, nhập điểm đi, điểm đến và ngày khởi hành mong muốn, sau đó bấm nút 'Tìm kiếm'.",
    },
    {
      icon: <CheckSquare className="w-8 h-8 text-teal-500" />,
      title: "Bước 2: Chọn chuyến & Chỗ ngồi",
      desc: "So sánh giá cả, thời gian, loại xe từ các nhà xe khác nhau. Bấm chọn chuyến bạn ưng ý và nhấp vào sơ đồ để chọn vị trí ghế/giường trống.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-purple-500" />,
      title: "Bước 3: Nhập thông tin & Thanh toán",
      desc: "Điền đầy đủ thông tin hành khách và thông tin liên hệ. Chọn phương thức thanh toán phù hợp (Thẻ tín dụng, MoMo, Chuyển khoản ngân hàng) và hoàn tất giao dịch trong vòng 15 phút.",
    },
    {
      icon: <Mail className="w-8 h-8 text-pink-500" />,
      title: "Bước 4: Nhận vé điện tử",
      desc: "Sau khi thanh toán thành công, hệ thống sẽ gửi Mã vé điện tử qua Email và SMS. Bạn cũng có thể tra cứu mã vé tại mục 'Tra cứu vé' trên website.",
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
            <Ticket className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hướng dẫn đặt vé
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Chỉ với 4 bước đơn giản, bạn đã có ngay tấm vé cho hành trình của
            mình.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            Trải nghiệm đặt vé ngay
          </button>
        </div>
      </div>
    </div>
  );
}
