import {
  MapPin,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import { Header } from '../Header/Header';
import { useContactPageLogic } from '../../../hooks/Logic/useContactPageLogic';
import type { ContactPageProps } from '../../../hooks/Props/layout/ContactProps';

export function ContactPage({
  onBack,
  isLoggedIn,
  onLoginClick,
  onMyTripsClick,
  onProfileClick,
  onLogout,
  onRoutesClick,
  onTicketLookupClick,
  onHotlineClick,
}: ContactPageProps) {
  const logic = useContactPageLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header
        onHomeClick={onBack}
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onMyTripsClick={onMyTripsClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onRoutesClick={onRoutesClick}
        onContactClick={() => {}}
        onTicketLookupClick={onTicketLookupClick}
        onHotlineClick={onHotlineClick}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
            {logic.t('contactTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {logic.t('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INFO */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl mb-6">
                {logic.t('contactInfo')}
              </h2>

              <div className="space-y-4">
                <InfoItem
                  icon={<MapPin />}
                  title={logic.t('addressLabel')}
                  value={logic.t('addressValue')}
                />
                <InfoItem
                  icon={<Phone />}
                  title={logic.t('phoneLabel')}
                  value="1900 6067 • +84 123 456 789"
                />
                <InfoItem
                  icon={<Mail />}
                  title={logic.t('emailLabel')}
                  value="support@busticket.com"
                />
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl mb-6">
              {logic.t('sendMessage')}
            </h2>

            <form
              onSubmit={logic.handleSubmit}
              className="space-y-6"
            >
              <Input
                label={logic.t('fullName')}
                value={logic.formData.name}
                onChange={logic.handleChange('name')}
                required
              />

              <Input
                label={logic.t('email')}
                type="email"
                value={logic.formData.email}
                onChange={logic.handleChange('email')}
                required
              />

              <Input
                label={logic.t('phone')}
                value={logic.formData.phone}
                onChange={logic.handleChange('phone')}
              />

              <Textarea
                label={logic.t('message')}
                value={logic.formData.message}
                onChange={logic.handleChange('message')}
                required
              />

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {logic.t('send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL UI PARTS ===== */

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
      <div className="p-3 bg-blue-500 text-white rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {value}
        </p>
      </div>
    </div>
  );
}

function Input(props: any) {
  return (
    <div>
      <label className="block mb-2">{props.label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border"
      />
    </div>
  );
}

function Textarea(props: any) {
  return (
    <div>
      <label className="block mb-2">{props.label}</label>
      <textarea
        {...props}
        rows={5}
        className="w-full px-4 py-3 rounded-xl border resize-none"
      />
    </div>
  );
}
