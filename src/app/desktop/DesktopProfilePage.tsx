import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { Settings, Upload, Image as ImageIcon, Heart, Award, Users, UserCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMyCollections } from '../hooks/useMyCollections';
import { useMyUploads } from '../hooks/useMyUploads';
import { useFollowingList, useFollowersList } from '../hooks/useFollowingList';
import { App, Modal } from 'antd';
import { deleteWallpaper, toggleFollowUser } from '../../api/wallpaper';

// 用户数据类型
interface FollowUser {
  id: number | string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  avatar?: string;
  is_following?: boolean;
  upload_count?: number;
  follower_count?: number;
}

type TabType = 'uploaded' | 'favorites' | 'following' | 'followers';

export default function DesktopProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [followingActionId, setFollowingActionId] = useState<number | string | null>(null);
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
    error: uploadsError,
    refresh: refreshUploads
  } = useMyUploads();

  // 获取关注列表
  const {
    users: followingUsers,
    loading: followingLoading,
    loadingMore: followingLoadingMore,
    error: followingError,
    hasMore: followingHasMore,
    loadMore: followingLoadMore,
    refresh: refreshFollowing
  } = useFollowingList();

  // 获取粉丝列表
  const {
    users: followersUsers,
    loading: followersLoading,
    loadingMore: followersLoadingMore,
    error: followersError,
    hasMore: followersHasMore,
    loadMore: followersLoadMore,
    refresh: refreshFollowers
  } = useFollowersList();

  // 删除壁纸
  const handleDeleteWallpaper = async (id: number | string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个壁纸吗？此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setDeletingId(id);
        try {
          await deleteWallpaper(id);
          message.success('删除成功');
          // 刷新列表
          refreshUploads();
        } catch (err) {
          console.error('删除失败:', err);
          message.error('删除失败，请重试');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // 关注/取消关注用户
  const handleToggleFollow = async (userId: number | string, currentIsFollowing: boolean) => {
    setFollowingActionId(userId);
    try {
      await toggleFollowUser(userId);
      // 乐观更新UI
      message.success(currentIsFollowing ? '已取消关注' : '已关注');
      // 刷新列表
      if (activeTab === 'following') {
        refreshFollowing();
      } else if (activeTab === 'followers') {
        refreshFollowers();
      }
    } catch (err) {
      console.error('关注操作失败:', err);
      message.error('操作失败，请重试');
    } finally {
      setFollowingActionId(null);
    }
  };

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
                      src={profile.avatar_url || profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.nickname || profile.username)}
                      alt={profile.nickname || profile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.nickname || profile.username}</h1>
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
                <button
                  onClick={() => setActiveTab('following')}
                  className="relative pb-4 font-semibold transition-colors"
                >
                  <span className={activeTab === 'following' ? 'text-blue-600' : 'text-gray-500'}>
                    {t.profile.following}
                  </span>
                  {activeTab === 'following' && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('followers')}
                  className="relative pb-4 font-semibold transition-colors"
                >
                  <span className={activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500'}>
                    {t.profile.followers}
                  </span>
                  {activeTab === 'followers' && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              </div>

              {activeTab === 'following' ? (
                // 关注列表
                <>
                  {followingLoading ? (
                    <div className="py-16 text-center">
                      <p className="text-gray-500">{t.common.loading}</p>
                    </div>
                  ) : followingError ? (
                    <div className="py-16 text-center">
                      <p className="text-red-500">加载失败，请重试</p>
                    </div>
                  ) : followingUsers.length > 0 ? (
                    <div className="divide-y divide-gray-100 bg-white rounded-xl shadow-sm">
                      {followingUsers.map((user) => (
                        <div
                          key={user.id}
                          className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* 头像 */}
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100">
                            <img
                              src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.nickname || user.username || 'User') as string)}&background=random`}
                              alt={user.nickname || user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* 用户信息 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-base">
                              {user.nickname || user.username}
                            </h3>
                          </div>
                          
                          {/* 操作按钮 */}
                          <button
                            onClick={() => handleToggleFollow(user.id, true)}
                            disabled={followingActionId === user.id}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                          >
                            {followingActionId === user.id ? t.common.loading : t.profile.unfollow}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t.profile.noFollowingYet}
                      </h3>
                      <p className="text-gray-500">
                        {t.profile.startFollowing}
                      </p>
                    </div>
                  )}
                  {/* 加载更多 */}
                  {followingHasMore && followingUsers.length > 0 && (
                    <div className="py-8 text-center">
                      <button
                        onClick={followingLoadMore}
                        disabled={followingLoadingMore}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                      >
                        {followingLoadingMore ? t.common.loading : '加载更多'}
                      </button>
                    </div>
                  )}
                </>
              ) : activeTab === 'followers' ? (
                // 粉丝列表
                <>
                  {followersLoading ? (
                    <div className="py-16 text-center">
                      <p className="text-gray-500">{t.common.loading}</p>
                    </div>
                  ) : followersError ? (
                    <div className="py-16 text-center">
                      <p className="text-red-500">加载失败，请重试</p>
                    </div>
                  ) : followersUsers.length > 0 ? (
                    <div className="divide-y divide-gray-100 bg-white rounded-xl shadow-sm">
                      {followersUsers.map((user) => (
                        <div
                          key={user.id}
                          className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* 头像 */}
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100">
                            <img
                              src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.nickname || user.username || 'User') as string)}&background=random`}
                              alt={user.nickname || user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* 用户信息 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-base">
                              {user.nickname || user.username}
                            </h3>
                          </div>
                          
                          {/* 操作按钮 */}
                          <button
                            onClick={() => handleToggleFollow(user.id, user.is_followed || false)}
                            disabled={followingActionId === user.id}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-all active:scale-95 ${
                              user.is_followed
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {followingActionId === user.id
                              ? t.common.loading
                              : user.is_followed
                              ? t.profile.unfollow
                              : t.profile.followBack}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t.profile.noFollowersYet}
                      </h3>
                      <p className="text-gray-500">
                        {t.profile.startFollowing}
                      </p>
                    </div>
                  )}
                  {/* 加载更多 */}
                  {followersHasMore && followersUsers.length > 0 && (
                    <div className="py-8 text-center">
                      <button
                        onClick={followersLoadMore}
                        disabled={followersLoadingMore}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                      >
                        {followersLoadingMore ? t.common.loading : '加载更多'}
                      </button>
                    </div>
                  )}
                </>
              ) : activeTab === 'favorites' ? (
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
                      <DesktopWallpaperGrid 
                        wallpapers={uploadedWallpapers} 
                        onDelete={(id) => handleDeleteWallpaper(id)}
                        deletingId={deletingId}
                      />
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