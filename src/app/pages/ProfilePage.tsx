import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { mockWallpapers } from '../mockData';
import { useMyUploads } from '../hooks/useMyUploads';
import { useMyCollections } from '../hooks/useMyCollections';
import { useUserProfile } from '../hooks/useUserProfile';
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

  // 获取用户信息
  const { profile } = useUserProfile();
  
  // 获取上传列表
  const { 
    wallpapers: uploadedWallpapers, 
    loading: uploadsLoading, 
    loadingMore: uploadsLoadingMore,
    error: uploadsError,
    hasMore: uploadsHasMore,
    loadMore: uploadsLoadMore 
  } = useMyUploads();

  // 获取收藏列表
  const { 
    wallpapers: favoriteWallpapers, 
    loading: favoritesLoading, 
    loadingMore: favoritesLoadingMore,
    error: favoritesError,
    hasMore: favoritesHasMore,
    loadMore: favoritesLoadMore 
  } = useMyCollections();

  // 根据当前Tab显示对应的数据
  const displayLoading = activeTab === 'uploaded' ? uploadsLoading : favoritesLoading;
  const displayLoadingMore = activeTab === 'uploaded' ? uploadsLoadingMore : favoritesLoadingMore;
  const displayError = activeTab === 'uploaded' ? uploadsError : favoritesError;
  const displayHasMore = activeTab === 'uploaded' ? uploadsHasMore : favoritesHasMore;
  const displayLoadMore = activeTab === 'uploaded' ? uploadsLoadMore : favoritesLoadMore;

  // 未登录状态
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>请先登录</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border-4 border-white/30">
                <img
                  src={profile.avatar_url || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname || profile.username)}`}
                  alt={profile.nickname || profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{profile.nickname || profile.username}</h1>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <span>{t.profile.level} {profile.level || 0}</span>
                  <span>•</span>
                  <span>{profile.points || 0} {t.profile.points}</span>
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
                <span className="text-2xl font-bold">{profile.upload_count ?? profile.uploadedCount ?? 0}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.uploaded}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart size={18} />
                <span className="text-2xl font-bold">{profile.collection_count ?? profile.favoritesCount ?? 0}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.favorites}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award size={18} />
                <span className="text-2xl font-bold">{profile.badges?.length ?? 0}</span>
              </div>
              <p className="text-xs text-white/80">{t.profile.badges}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4 mb-6">
        <Link
          to="/upload"
          className="profile-upload-btn flex items-center justify-center gap-2 w-full bg-white py-3.5 rounded-3xl no-underline text-blue-600 [&_svg]:shrink-0"
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
        {activeTab === 'uploaded' ? (
          // 上传列表
          <>
            {uploadsLoading ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-500">{t.common.loading}</div>
              </div>
            ) : uploadsError ? (
              <div className="px-4 py-16 text-center">
                <div className="text-red-500">加载失败，请重试</div>
              </div>
            ) : uploadedWallpapers.length > 0 ? (
              <>
                <WallpaperGrid wallpapers={uploadedWallpapers} />
                {/* 加载更多 */}
                {uploadsHasMore && (
                  <div className="px-4 py-6 text-center">
                    <button
                      onClick={uploadsLoadMore}
                      disabled={uploadsLoadingMore}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {uploadsLoadingMore ? t.common.loading : '加载更多'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.profile.noUploadsYet}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t.profile.uploadFirstWallpaper}
                </p>
              </div>
            )}
          </>
        ) : (
          // 收藏列表
          <>
            {favoritesLoading ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-500">{t.common.loading}</div>
              </div>
            ) : favoritesError ? (
              <div className="px-4 py-16 text-center">
                <div className="text-red-500">加载失败，请重试</div>
              </div>
            ) : favoriteWallpapers.length > 0 ? (
              <>
                <WallpaperGrid wallpapers={favoriteWallpapers} />
                {/* 加载更多 */}
                {favoritesHasMore && (
                  <div className="px-4 py-6 text-center">
                    <button
                      onClick={favoritesLoadMore}
                      disabled={favoritesLoadingMore}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {favoritesLoadingMore ? t.common.loading : '加载更多'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.profile.noFavoritesYet}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t.profile.startFavoriting}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}