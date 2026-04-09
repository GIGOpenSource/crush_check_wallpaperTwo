import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    uploads: false,
  });

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languageOptions.find((lang) => lang.code === language);

  const settingsSections = [
    {
      title: t.settings.accountSettings,
      items: [
        {
          icon: User,
          label: t.settings.profileSettings,
          onClick: () => {},
          chevron: true,
        },
        {
          icon: Globe,
          label: (currentLanguage?.flag ?? '') + ' ' + (currentLanguage?.name ?? ''),
          onClick: () => {},
          chevron: true,
          isLanguage: true,
        },
        {
          icon: isDarkMode ? Moon : Sun,
          label: isDarkMode ? t.settings.darkMode : t.settings.lightMode,
          toggle: true,
          value: isDarkMode,
          onChange: setIsDarkMode,
        },
      ],
    },
    {
      title: t.settings.notifications,
      items: [
        {
          icon: Bell,
          label: t.settings.notificationLikes,
          toggle: true,
          value: notifications.likes,
          onChange: (val: boolean) => setNotifications({ ...notifications, likes: val }),
        },
        {
          icon: Bell,
          label: t.settings.notificationComments,
          toggle: true,
          value: notifications.comments,
          onChange: (val: boolean) => setNotifications({ ...notifications, comments: val }),
        },
        {
          icon: Bell,
          label: t.settings.notificationFollows,
          toggle: true,
          value: notifications.follows,
          onChange: (val: boolean) => setNotifications({ ...notifications, follows: val }),
        },
        {
          icon: Bell,
          label: t.settings.notificationUploads,
          toggle: true,
          value: notifications.uploads,
          onChange: (val: boolean) => setNotifications({ ...notifications, uploads: val }),
        },
      ],
    },
    {
      title: t.settings.about,
      items: [
        {
          icon: Shield,
          label: t.settings.privacyPolicy,
          onClick: () => {},
          chevron: true,
        },
        {
          icon: HelpCircle,
          label: t.settings.helpSupport,
          onClick: () => {},
          chevron: true,
        },
        {
          icon: Palette,
          label: t.settings.aboutApp,
          onClick: () => {},
          chevron: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t.profile.settings}</h1>
        </div>
      </header>

      {/* Settings Sections */}
      <div className="py-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white">
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {section.title}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <item.icon size={20} className="text-gray-700" />
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  
                  {item.toggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onChange?.(!item.value);
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        item.value ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        layout
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ left: item.value ? '26px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  )}
                  
                  {item.chevron && (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Language Selector */}
        <div className="bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t.settings.language}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {languageOptions.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(lang.code as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  language === lang.code
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span
                  className={`font-medium text-sm ${
                    language === lang.code ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {lang.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full bg-white border-2 border-red-200 text-red-600 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>{t.settings.logOut}</span>
          </motion.button>
        </div>

        {/* Version Info */}
        <div className="px-4 text-center">
          <p className="text-sm text-gray-400">{t.settings.appVersion}</p>
          <p className="text-xs text-gray-400 mt-1">{t.settings.copyright}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
