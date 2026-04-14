import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export default function DesktopSettingsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DesktopSidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{t.profile.settings}</h1>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Account Settings */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.accountSettings}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/profile/edit')}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.settings.profileSettings}</h3>
                      <p className="text-sm text-gray-500">{t.settings.profileSettingsDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </motion.div>
                
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Shield size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.settings.privacySecurity}</h3>
                      <p className="text-sm text-gray-500">{t.settings.privacySecurityDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.appearance}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      {isDarkMode ? (
                        <Moon size={24} className="text-yellow-600" />
                      ) : (
                        <Sun size={24} className="text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {isDarkMode ? t.settings.darkMode : t.settings.lightMode}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isDarkMode ? t.settings.themeDarkEnabled : t.settings.themeLightEnabled}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ left: isDarkMode ? '30px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Language */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.language}</h2>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-3 gap-3">
                  {languageOptions.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                        language === lang.code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span
                        className={`font-medium ${
                          language === lang.code ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {lang.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.notifications}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { key: 'likes' as const, label: t.settings.notificationLikes, description: t.settings.notificationLikesDesc },
                  { key: 'comments' as const, label: t.settings.notificationComments, description: t.settings.notificationCommentsDesc },
                  { key: 'follows' as const, label: t.settings.notificationFollows, description: t.settings.notificationFollowsDesc },
                  { key: 'uploads' as const, label: t.settings.notificationUploads, description: t.settings.notificationUploadsDesc },
                ].map((item) => (
                  <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Bell size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ 
                        ...prev, 
                        [item.key]: !prev[item.key] 
                      }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        layout
                        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ 
                          left: notifications[item.key] ? '30px' : '2px' 
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* About */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.about}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <HelpCircle size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.settings.helpSupport}</h3>
                      <p className="text-sm text-gray-500">{t.settings.helpSupportDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <Palette size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.settings.aboutApp}</h3>
                      <p className="text-sm text-gray-500">{t.settings.aboutAppDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-200">
                <h2 className="text-xl font-bold text-red-600">{t.settings.dangerZone}</h2>
              </div>
              <div className="px-6 py-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20} />
                  <span>{t.settings.logOut}</span>
                </motion.button>
              </div>
            </section>

            {/* Version Info */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">{t.settings.appVersion}</p>
              <p className="text-xs text-gray-400 mt-1">{t.settings.copyright}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
