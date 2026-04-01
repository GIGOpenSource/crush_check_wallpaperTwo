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

  const currentLanguage = languageOptions.find(lang => lang.code === language);

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
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                      <p className="text-sm text-gray-500">Update your profile information</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Shield size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
                      <p className="text-sm text-gray-500">Manage your privacy settings</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
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
                      <h3 className="font-semibold text-gray-900">Dark Mode</h3>
                      <p className="text-sm text-gray-500">
                        {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
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
                <h2 className="text-xl font-bold text-gray-900">Language</h2>
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
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { key: 'likes', label: 'Likes', description: 'When someone likes your wallpaper' },
                  { key: 'comments', label: 'Comments', description: 'When someone comments on your wallpaper' },
                  { key: 'follows', label: 'New Followers', description: 'When someone follows you' },
                  { key: 'uploads', label: 'Upload Notifications', description: 'Updates about your uploads' },
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
                      onClick={() => setNotifications({ 
                        ...notifications, 
                        [item.key]: !notifications[item.key as keyof typeof notifications] 
                      })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        layout
                        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ 
                          left: notifications[item.key as keyof typeof notifications] ? '30px' : '2px' 
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
                <h2 className="text-xl font-bold text-gray-900">About</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <HelpCircle size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Help & Support</h3>
                      <p className="text-sm text-gray-500">Get help and contact support</p>
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
                      <h3 className="font-semibold text-gray-900">About WallHaven</h3>
                      <p className="text-sm text-gray-500">Learn more about our platform</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-200">
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
              <div className="px-6 py-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Log Out</span>
                </motion.button>
              </div>
            </section>

            {/* Version Info */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">WallHaven v1.0.0</p>
              <p className="text-xs text-gray-400 mt-1">© 2026 WallHaven. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
