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
  Sun,
  Moon,
  Heart,
  MessageCircle,
  Reply,
  UserPlus,
  Globe,
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { setAuthToken } from '../../api/request';
import { logoutUser } from '../../api/auth';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useUserProfile();
  const { settings: notificationSettings, loading: settingsLoading, updateSetting } = useNotificationSettings();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: 'CN' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'ja', name: '日本語', flag: 'JP' },
    { code: 'ko', name: '한국어', flag: 'KR' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
  ];

  const handleLanguageChange = (langCode: 'zh-CN' | 'en' | 'ja' | 'ko' | 'es' | 'fr') => {
    setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleLogout = async () => {
    modal.confirm({
      title: t.settings.logOut,
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
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
          label: t.settings.language,
          onClick: () => setShowLanguageModal(true),
          chevron: true,
          value: languageOptions.find(lang => lang.code === language)?.name || 'English',
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
          onClick: () => navigate('/site-info/privacy'),
          chevron: true,
        },
        {
          icon: HelpCircle,
          label: t.settings.helpSupport,
          onClick: () => navigate('/site-info/help'),
          chevron: true,
        },
        {
          icon: Palette,
          label: t.settings.aboutApp,
          onClick: () => navigate('/site-info/about'),
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.label}</span>
                      {item.value && typeof item.value === 'string' && (
                        <span className="text-sm text-gray-500">{item.value}</span>
                      )}
                    </div>
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

      {/* Language Selection Modal */}
      <Modal
        title={t.settings.language}
        open={showLanguageModal}
        onCancel={() => setShowLanguageModal(false)}
        footer={null}
        width={280}
        className="rounded-2xl"
        styles={{
          body: { padding: '12px' }
        }}
      >
        <div className="space-y-1 py-1">
          {languageOptions.map((lang) => (
            <motion.button
              key={lang.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLanguageChange(lang.code as 'zh-CN' | 'en' | 'ja' | 'ko' | 'es' | 'fr')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                language === lang.code
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-gray-800 w-7 text-center">
                  {lang.flag}
                </span>
                <span className={`text-sm ${language === lang.code ? 'text-blue-600 font-semibold' : 'text-gray-700 font-medium'}`}>
                  {lang.name}
                </span>
              </div>
              {language === lang.code && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
