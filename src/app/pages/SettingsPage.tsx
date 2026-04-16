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
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  Heart,
  MessageCircle,
  Reply,
  UserPlus,
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { setAuthToken } from '../../api/request';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useUserProfile();
  const { settings: notificationSettings, loading: settingsLoading, updateSetting } = useNotificationSettings();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    modal.confirm({
      title: t.settings.logOut,
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        // 清除 token
        setAuthToken('');
        // 跳转到登录页（保持当前视图模式）
        navigate('/login', { replace: true });
      },
    });
  };

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languageOptions.find((lang) => lang.code === profile?.language);

  const settingsSections = [
    {
      title: t.settings.accountSettings,
      items: [
        {
          icon: User,
          label: t.settings.profileSettings,
          onClick: () => navigate('/profile/edit'),
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
          icon: Heart,
          label: t.settings.notificationLikes,
          toggle: true,
          value: notificationSettings?.enable_like_notification ?? false,
          onChange: (val: boolean) => updateSetting('enable_like_notification', val),
          updating: settingsLoading || false,
        },
        {
          icon: MessageCircle,
          label: t.settings.notificationComments,
          toggle: true,
          value: notificationSettings?.enable_comment_notification ?? false,
          onChange: (val: boolean) => updateSetting('enable_comment_notification', val),
          updating: settingsLoading || false,
        },
        {
          icon: Reply,
          label: t.settings.notificationReplies,
          toggle: true,
          value: notificationSettings?.enable_reply_notification ?? false,
          onChange: (val: boolean) => updateSetting('enable_reply_notification', val),
          updating: settingsLoading || false,
        },
        {
          icon: UserPlus,
          label: t.settings.notificationFollows,
          toggle: true,
          value: notificationSettings?.enable_follow_notification ?? false,
          onChange: (val: boolean) => updateSetting('enable_follow_notification', val),
          updating: settingsLoading || false,
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
                        if (!item.updating) {
                          item.onChange?.(!item.value);
                        }
                      }}
                      disabled={item.updating}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        item.value ? 'bg-blue-600' : 'bg-gray-300'
                      } ${item.updating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onClick={handleLogout}
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
