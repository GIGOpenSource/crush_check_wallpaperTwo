import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { Settings, Upload, Image as ImageIcon, Heart, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMyCollections } from '../hooks/useMyCollections';
import { useMyUploads } from '../hooks/useMyUploads';

type TabType = 'uploaded' | 'favorites';

export default function DesktopProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const { 
    wallpapers: favoriteWallpapers, 
    loading: favoritesLoading, 
    loadingMore: favoritesLoadingMore,
    hasMore: favoritesHasMore, 
    loadMore: favoritesLoadMore,
    error: favoritesError 
  } = useMyCollections();

  const { 
    wallpapers: uploadedWallpapers, 
    loading: uploadsLoading, 
    loadingMore: uploadsLoadingMore,
    hasMore: uploadsHasMore, 
    loadMore: uploadsLoadMore,
    error: uploadsError 
  } = useMyUploads();

  // 加载中状态
  if (profileLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (profileError) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-red-500 text-center">
            <p>{profileError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* 用户信息区 */}
              <div className="flex items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.username)}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                    <div className="flex items-center gap-3 text-white/90 mb-3">
                      <span>等级 {profile.level || 0}</span>
                      <span>•</span>
                      <span>{profile.points || 0} 积分</span>
                    </div>
                    <button
                      onClick={() => navigate('/upload')}
                      className="bg-white text-blue-600 py-2 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
                    >
                      <Upload size={16} />
                      <span>上传壁纸</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ImageIcon size={24} className="opacity-80" />
                    <div className="text-3xl font-bold">{profile.upload_count ?? profile.uploadedCount ?? 0}</div>
                  </div>
                  <div className="text-white/80 text-sm">已上传</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart size={24} className="opacity-80" />
                    <div className="text-3xl font-bold">{profile.collection_count ?? profile.favoritesCount ?? 0}</div>
                  </div>
                  <div className="text-white/80 text-sm">收藏</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award size={24} className="opacity-80" />
                    <div className="text-3xl font-bold">{profile.badges?.length ?? 0}</div>
                  </div>
                  <div className="text-white/80 text-sm">徽章</div>
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
              {profile.badges && profile.badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {profile.badges.map((badge) => (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>还没有获得徽章</p>
                </div>
              )}
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

              {activeTab === 'favorites' ? (
                // 收藏列表 - 使用真实数据
                <>
                  {favoritesLoading ? (
                    <div className="py-16 text-center">
                      <p className="text-gray-500">{t.common.loading}</p>
                    </div>
                  ) : favoritesError ? (
                    <div className="py-16 text-center">
                      <p className="text-red-500">加载失败，请重试</p>
                    </div>
                  ) : favoriteWallpapers.length > 0 ? (
                    <>
                      <DesktopWallpaperGrid wallpapers={favoriteWallpapers} />
                      {/* 加载更多 */}
                      {favoritesHasMore && (
                        <div className="py-8 text-center">
                          <button
                            onClick={favoritesLoadMore}
                            disabled={favoritesLoadingMore}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                          >
                            {favoritesLoadingMore ? t.common.loading : '加载更多'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Heart size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t.profile.noFavoritesYet}
                      </h3>
                      <p className="text-gray-500 mb-8">
                        {t.profile.startFavoriting}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // 上传列表 - 使用真实数据
                <>
                  {uploadsLoading ? (
                    <div className="py-16 text-center">
                      <p className="text-gray-500">{t.common.loading}</p>
                    </div>
                  ) : uploadsError ? (
                    <div className="py-16 text-center">
                      <p className="text-red-500">加载失败，请重试</p>
                    </div>
                  ) : uploadedWallpapers.length > 0 ? (
                    <>
                      <DesktopWallpaperGrid wallpapers={uploadedWallpapers} />
                      {/* 加载更多 */}
                      {uploadsHasMore && (
                        <div className="py-8 text-center">
                          <button
                            onClick={uploadsLoadMore}
                            disabled={uploadsLoadingMore}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                          >
                            {uploadsLoadingMore ? t.common.loading : '加载更多'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t.profile.noUploadsYet}
                      </h3>
                      <p className="text-gray-500 mb-8">
                        {t.profile.uploadFirstWallpaper}
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}