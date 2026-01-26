import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Bus } from 'lucide-react';
import type { FooterProps } from '../../../hooks/Props/layout/FooterProps';
import { useFooterLogic } from '../../../hooks/Logic/useFooterLogic';

export function Footer(props: FooterProps = {}) {
  const { t, handleNavigation } = useFooterLogic(props);
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Bus className="w-10 h-10 text-blue-400" />
              <span className="text-2xl bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Online Bus Ticket Platform
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('platformDescription') || 'Nền tảng đặt vé xe khách trực tuyến hàng đầu Việt Nam, kết nối hành khách với hàng trăm nhà xe uy tín trên toàn quốc.'}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-red-600 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">{t('aboutUs') || 'Về chúng tôi'}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('about-us')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('aboutCompany') || 'Giới thiệu công ty'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('faq')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('faq') || 'Câu hỏi thường gặp'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('terms')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('termsOfService') || 'Điều khoản dịch vụ'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('privacy')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('privacyPolicy') || 'Chính sách bảo mật'}
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">{t('support') || 'Hỗ trợ'}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('booking-guide')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('bookingGuide') || 'Hướng dẫn đặt vé'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('refund')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('refundPolicy') || 'Chính sách hoàn tiền'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('contact-us')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('contact') || 'Liên hệ'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('feedback')} 
                  className="hover:text-blue-400 transition-all text-left"
                >
                  {t('feedbackAndComplaint') || 'Góp ý & Khiếu nại'}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">{t('contactInfo') || 'Thông tin liên hệ'}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span>{t('addressValue') || 'Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-400" />
                <a href="tel:19006067" className="hover:text-blue-400 transition-all">1900 6067</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:support@busticket.com" className="hover:text-blue-400 transition-all">support@busticket.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Online Bus Ticket Platform. {t('allRightsReserved') || 'Tất cả các quyền được bảo lưu.'}</p>
          <p className="text-sm mt-2">Giấy phép kinh doanh số: 0123456789 do Sở KH&ĐT TP. HCM cấp ngày 01/01/2024</p>
        </div>
      </div>
    </footer>
  );
}