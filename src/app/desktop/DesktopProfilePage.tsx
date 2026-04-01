import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { currentUser, mockWallpapers } from '../mockData';
import { Settings, Upload, Image as ImageIcon, Heart, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'uploaded' | 'favorites';

export default function DesktopProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');

  const uploadedWallpapers = mockWallpapers.slice(0, 8);
  const favoriteWallpapers = mockWallpapers.slice(8, 16);

  const displayWallpapers = activeTab === 'uploaded' ? uploadedWallpapers : favoriteWallpapers;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{currentUser.username}</h1>
                    <div className="flex items-center gap-4 text-white/90 mb-4">
                      <span className="text-lg">{t.profile.level} {currentUser.level}</span>
                      <span>•</span>
                      <span className="text-lg">{currentUser.points} {t.profile.points}</span>
                    </div>
                    <button
                      onClick={() => navigate('/upload')}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-colors"
                    >
                      <Upload size={20} />
                      {t.profile.uploadWallpaper}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Settings size={24} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ImageIcon size={24} />
                    <span className="text-3xl font-bold">{currentUser.uploadedCount}</span>
                  </div>
                  <p className="text-white/80">{t.profile.uploaded}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart size={24} />
                    <span className="text-3xl font-bold">{currentUser.favoritesCount}</span>
                  </div>
                  <p className="text-white/80">{t.profile.favorites}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award size={24} />
                    <span className="text-3xl font-bold">{currentUser.badges.length}</span>
                  </div>
                  <p className="text-white/80">{t.profile.badges}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Badges */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.profile.achievementBadges}</h2>
              <div className="grid grid-cols-3 gap-4">
                {currentUser.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
                  >
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tabs and Content */}
            <section>
              <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('uploaded')}
                  className="relative pb-4 font-semibold transition-colors"
                >
                  <span className={activeTab === 'uploaded' ? 'text-blue-600' : 'text-gray-500'}>
                    {t.profile.uploaded}
                  </span>
                  {activeTab === 'uploaded' && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="relative pb-4 font-semibold transition-colors"
                >
                  <span className={activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-500'}>
                    {t.profile.favorites}
                  </span>
                  {activeTab === 'favorites' && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              </div>

              {displayWallpapers.length > 0 ? (
                <DesktopWallpaperGrid wallpapers={displayWallpapers} />
              ) : (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    {activeTab === 'uploaded' ? (
                      <ImageIcon size={40} className="text-gray-400" />
                    ) : (
                      <Heart size={40} className="text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {activeTab === 'uploaded' ? t.profile.noUploadsYet : t.profile.noFavoritesYet}
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {activeTab === 'uploaded'
                      ? t.profile.uploadFirstWallpaper
                      : t.profile.startFavoriting}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}