import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Bus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Bus className="w-10 h-10 text-blue-400" />
              <span className="text-2xl bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Online Bus Ticket Platform
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {t("platformDescription") ||
                "Nền tảng đặt vé xe khách trực tuyến hàng đầu Việt Nam, kết nối hành khách với hàng trăm nhà xe uy tín trên toàn quốc."}
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-red-600 transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">
              {t("aboutUs") || "Về chúng tôi"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("aboutCompany") || "Giới thiệu công ty"}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("faq") || "Câu hỏi thường gặp"}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("termsOfService") || "Điều khoản dịch vụ"}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("privacyPolicy") || "Chính sách bảo mật"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">{t("support") || "Hỗ trợ"}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/guide"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("bookingGuide") || "Hướng dẫn đặt vé"}
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("refundPolicy") || "Chính sách hoàn tiền"}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("contact") || "Liên hệ"}
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="hover:text-blue-400 transition-all text-left block"
                >
                  {t("feedbackAndComplaint") || "Góp ý & Khiếu nại"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">
              {t("contactInfo") || "Thông tin liên hệ"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                <span>
                  {t("addressValue") ||
                    "Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh"}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-400" />
                <a
                  href="tel:19006067"
                  className="hover:text-blue-400 transition-all"
                >
                  1900 6067
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <a
                  href="mailto:support@busticket.com"
                  className="hover:text-blue-400 transition-all"
                >
                  support@busticket.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Online Bus Ticket Platform.{" "}
            {t("allRightsReserved") || "Tất cả các quyền được bảo lưu."}
          </p>
          <p className="text-sm mt-2">
            Giấy phép kinh doanh số: 0123456789 do Sở KH&ĐT TP. HCM cấp ngày
            01/01/2024
          </p>
        </div>
      </div>
    </footer>
  );
}
