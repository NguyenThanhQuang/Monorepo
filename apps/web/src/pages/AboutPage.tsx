import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  Shield,
  Users,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";

export function AboutPage() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: <Bus className="w-6 h-6" />,
      value: "500+",
      label: "Nhà xe đối tác",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      value: "1000+",
      label: "Tuyến đường",
    },
    { icon: <Users className="w-6 h-6" />, value: "2M+", label: "Khách hàng" },
    { icon: <Star className="w-6 h-6" />, value: "4.8/5", label: "Đánh giá" },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "An toàn & Uy tín",
      desc: "Chúng tôi chỉ hợp tác với những nhà xe đạt chuẩn chất lượng, đảm bảo an toàn tuyệt đối cho mọi hành trình của bạn.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-teal-500" />,
      title: "Công nghệ tiên phong",
      desc: "Hệ thống đặt vé thời gian thực, giữ chỗ tức thì và hỗ trợ thanh toán đa nền tảng hiện đại nhất.",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Khách hàng là trọng tâm",
      desc: "Đội ngũ CSKH hoạt động 24/7, luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-500 to-teal-500 py-20 text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md shadow-xl mb-8">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nền tảng đặt vé xe khách số 1 Việt Nam
          </h1>
          <p className="text-lg md:text-xl text-blue-50 leading-relaxed max-w-3xl mx-auto">
            Sứ mệnh của chúng tôi là xóa bỏ mọi rào cản trong việc di chuyển,
            mang lại trải nghiệm mua vé xe khách nhanh chóng, minh bạch và tiện
            lợi nhất cho hàng triệu người dân.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border border-gray-100 dark:border-gray-700">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Giá trị cốt lõi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Những nguyên tắc định hình cách chúng tôi xây dựng sản phẩm và phục
            vụ khách hàng mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
