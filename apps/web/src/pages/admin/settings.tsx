import {
  Save,
  Bell,
  Globe,
  Building2,
  Shield,
  CreditCard,
} from 'lucide-react';
import { useSettingsPageLogic } from '../../hooks/Logic/settings';


export function SettingsPage() {
  const {
    t,

    selectedTab,
    setSelectedTab,

    companySettings,
    setCompanySettings,

    handleSave,
  } = useSettingsPageLogic();

  const tabs = [
    { id: 'general', icon: Globe, label: t('general') },
    { id: 'company', icon: Building2, label: t('companyInfo') },
    { id: 'notifications', icon: Bell, label: t('notifications') },
    { id: 'security', icon: Shield, label: t('security') },
    { id: 'payment', icon: CreditCard, label: t('payment') },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl text-gray-900 dark:text-white mb-2">
          {t('settings')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('settingsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border p-3 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* ví dụ 1 block – các block khác giữ nguyên UI của bạn */}
          {selectedTab === 'company' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border">
              <h3 className="text-xl mb-4">{t('companySettings')}</h3>

              <input
                value={companySettings.name}
                onChange={(e) =>
                  setCompanySettings({
                    ...companySettings,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t('saveAllChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
