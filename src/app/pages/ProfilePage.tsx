import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { currentUser, mockWallpapers } from '../mockData';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Heart,
  Award,
  TrendingUp,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'uploaded' | 'favorites';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');

  // Mock data - in real app, these would be filtered by user
  const uploadedWallpapers = mockWallpapers.slice(0, 6);
  const favoriteWallpapers = mockWallpapers.slice(6, 12);

  const displayWallpapers = activeTab === 'uploaded' ? uploadedWallpapers : favoriteWallpapers;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border-4 border-white/30">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{currentUser.username}</h1>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <span>{t.profile.level} {currentUser.level}</span>
                  <span>•</span>
                  <span>{currentUser.points} {t.profile.points}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ImageIcon size={18} />
                <span className="text-2xl font-bold">{currentUser.uploadedCount}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.uploaded}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart size={18} />
                <span className="text-2xl font-bold">{currentUser.favoritesCount}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.favorites}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award size={18} />
                <span className="text-2xl font-bold">{currentUser.badges.length}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.badges}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Button */}
      <div className="px-4 -mt-6 mb-6">
        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Upload size={20} />
          <span className="font-semibold">{t.profile.uploadWallpaper}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex">
          <button
            onClick={() => setActiveTab('uploaded')}
            className="flex-1 relative py-4 font-semibold transition-colors"
          >
            <span className={activeTab === 'uploaded' ? 'text-blue-600' : 'text-gray-500'}>
              {t.profile.uploaded}
            </span>
            {activeTab === 'uploaded' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className="flex-1 relative py-4 font-semibold transition-colors"
          >
            <span className={activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-500'}>
              {t.profile.favorites}
            </span>
            {activeTab === 'favorites' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        {displayWallpapers.length > 0 ? (
          <WallpaperGrid wallpapers={displayWallpapers} />
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              {activeTab === 'uploaded' ? (
                <ImageIcon size={32} className="text-gray-400" />
              ) : (
                <Heart size={32} className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'uploaded' ? t.profile.noUploadsYet : t.profile.noFavoritesYet}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'uploaded'
                ? t.profile.uploadFirstWallpaper
                : t.profile.startFavoriting}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}