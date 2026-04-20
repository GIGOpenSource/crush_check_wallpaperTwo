import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { App, Modal } from 'antd';
import {
  User,
  Shield,
  Palette,
  Bell,
  Info,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Monitor,
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  Heart,
  MessageCircle,
  Reply,
  UserPlus,
} from 'lucide-react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { setAuthToken } from '../../api/request';
import { logoutUser } from '../../api/auth';
import { motion } from 'motion/react';

export default function DesktopSettingsPage() {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useUserProfile();
  const { settings: notificationSettings, loading: settingsLoading, updateSetting } = useNotificationSettings();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    modal.confirm({
      title: t.settings.logOut,
      content: t.settings.logOutConfirm,
      okText: t.common.confirm,
      cancelText: t.common.cancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // 调用后端退出登录接口
          await logoutUser();
        } catch (err) {
          console.error('退出登录接口调用失败:', err);
          // 即使接口失败，也继续清除本地 token
        } finally {
          // 清除本地 token
          setAuthToken('');
          // 跳转到登录页（保持当前视图模式）
          navigate('/login', { replace: true });
        }
      },
    });
  };

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: 'CN' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ja', name: '日本語', flag: 'JP' },
    { code: 'ko', name: '한국어', flag: 'KR' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
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
                
                <div 
                  onClick={() => navigate('/site-info/privacy')}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
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
            {/* <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            </section> */}

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
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                        language === lang.code
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-800">
                        {lang.flag}
                      </span>
                      <span
                        className={`font-semibold ${
                          language === lang.code ? 'text-blue-700' : 'text-gray-700'
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
                  { 
                    key: 'enable_like_notification' as const, 
                    label: t.settings.notificationLikes, 
                    description: t.settings.notificationLikesDesc,
                    icon: Heart,
                    iconColor: 'text-red-600',
                    iconBg: 'bg-red-100',
                  },
                  { 
                    key: 'enable_comment_notification' as const, 
                    label: t.settings.notificationComments, 
                    description: t.settings.notificationCommentsDesc,
                    icon: MessageCircle,
                    iconColor: 'text-blue-600',
                    iconBg: 'bg-blue-100',
                  },
                  { 
                    key: 'enable_reply_notification' as const, 
                    label: t.settings.notificationReplies, 
                    description: t.settings.notificationRepliesDesc,
                    icon: Reply,
                    iconColor: 'text-green-600',
                    iconBg: 'bg-green-100',
                  },
                  { 
                    key: 'enable_follow_notification' as const, 
                    label: t.settings.notificationFollows, 
                    description: t.settings.notificationFollowsDesc,
                    icon: UserPlus,
                    iconColor: 'text-purple-600',
                    iconBg: 'bg-purple-100',
                  },
                ].map((item) => (
                  <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${item.iconBg} rounded-xl`}>
                        <item.icon size={24} className={item.iconColor} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key, !notificationSettings?.[item.key])}
                      disabled={settingsLoading}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notificationSettings?.[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                      } ${settingsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <motion.div
                        layout
                        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ 
                          left: notificationSettings?.[item.key] ? '30px' : '2px' 
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
                <div 
                  onClick={() => navigate('/site-info/help')}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
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
                
                <div 
                  onClick={() => navigate('/site-info/about')}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
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
                  onClick={handleLogout}
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
