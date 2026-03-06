import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquareWarning,
  Send,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeedbackPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    type: "feedback",
    name: "",
    phone: "",
    email: "",
    ticketCode: "",
    content: "",
  });

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cảm ơn bạn! Chúng tôi đã ghi nhận và sẽ phản hồi sớm nhất.");
    setFormData({
      type: "feedback",
      name: "",
      phone: "",
      email: "",
      ticketCode: "",
      content: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl mb-6">
            <MessageSquareWarning className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Góp ý & Khiếu nại
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Mọi ý kiến đóng góp của bạn đều giúp OBTP nâng cao chất lượng dịch
            vụ.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl border border-blue-200 dark:border-blue-800/50">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="m-0 text-sm leading-relaxed">
              Đối với các khiếu nại liên quan đến chuyến đi, vui lòng cung cấp
              đúng <strong>Mã vé</strong> để bộ phận CSKH có thể đối soát và hỗ
              trợ bạn nhanh nhất (Tối đa 24h làm việc).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loại phản hồi <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={handleChange("type")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="feedback">Góp ý cải thiện dịch vụ</option>
                  <option value="complaint">
                    Khiếu nại chuyến đi / Nhà xe
                  </option>
                  <option value="other">Vấn đề khác</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã vé (Nếu có)
                </label>
                <input
                  value={formData.ticketCode}
                  onChange={handleChange("ticketCode")}
                  placeholder="VD: TICKET-X8Y9Z0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={handleChange("name")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.content}
                onChange={handleChange("content")}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-5 h-5" />
              Gửi thông tin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
