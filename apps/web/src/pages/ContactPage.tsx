import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("messageSent") || "Tin nhắn đã được gửi thành công!");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4 font-bold">
            {t("contactTitle")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("contactSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INFO */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl mb-6 font-semibold text-gray-900 dark:text-white">
                {t("contactInfo")}
              </h2>

              <div className="space-y-6">
                <InfoItem
                  icon={<MapPin />}
                  title={t("addressLabel") || "Địa chỉ"}
                  value={t("addressValue")}
                />
                <InfoItem
                  icon={<Phone />}
                  title={t("phoneLabel") || "Điện thoại"}
                  value="1900 6067 • +84 123 456 789"
                />
                <InfoItem
                  icon={<Mail />}
                  title={t("emailLabel")}
                  value="support@busticket.com"
                />
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl mb-6 font-semibold text-gray-900 dark:text-white">
              {t("sendMessage")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("fullName")}
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
                  {t("email")}
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("phone")}
                </label>
                <input
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("message")}
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange("message")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-linear-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-5 h-5" />
                {t("send")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {value}
        </p>
      </div>
    </div>
  );
}
