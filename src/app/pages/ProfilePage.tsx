import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { UploadWallpaperGrid } from '../components/UploadWallpaperGrid';
import { mockWallpapers } from '../mockData';
import { useMyUploads } from '../hooks/useMyUploads';
import { useMyCollections } from '../hooks/useMyCollections';
import { useUserProfile } from '../hooks/useUserProfile';
import { useFollowingList, useFollowersList } from '../hooks/useFollowingList';
import { getAuthToken } from '../../api/request';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Heart,
  Award,
  TrendingUp,
  Share2,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { App, Modal } from 'antd';
import { deleteWallpaper, toggleFollowUser, getUserProfile } from '../../api/wallpaper';

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { message } = App.useApp();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const otherId = searchParams.get('other_id');
  
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [followingActionId, setFollowingActionId] = useState<number | string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | string | null>(null);

  // 获取当前登录用户的ID
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const response = await getUserProfile();
        const profile = (response?.data || response) as Record<string, unknown>;
        if (profile && typeof profile === 'object') {
          const id = profile.id || profile.customer_id;
          if (id && (typeof id === 'number' || typeof id === 'string')) {
            setCurrentUserId(id);
          }
        }
      } catch (err) {
        console.error('获取当前用户ID失败:', err);
      }
    };
    
    fetchCurrentUserId();
  }, []);

  // 判断是否是查看其他用户的页面
  // 严格判断：只有明确传入了otherId且与当前用户ID不同时，才是查看他人主页
  const isOtherUser = !!otherId && String(otherId) !== String(currentUserId);
  
  // 获取用户信息（如果是其他用户，传递 otherId）
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserProfile(otherId || undefined);
  
  // 始终调用 Hook，避免条件调用违反 React Hooks 规则
  const myCollectionsResult = useMyCollections();
  const myUploadsResult = useMyUploads();
  
  // 查看他人主页时，不显示自己的上传和收藏数据
  const { 
    wallpapers: favoriteWallpapers, 
    loading: favoritesLoading, 
    loadingMore: favoritesLoadingMore,
    error: favoritesError,
    hasMore: favoritesHasMore,
    loadMore: favoritesLoadMore 
  } = isOtherUser ? { 
    wallpapers: [], 
    loading: false, 
    loadingMore: false,
    error: null,
    hasMore: false,
    loadMore: () => {}
  } : myCollectionsResult;

  const { 
    wallpapers: uploadedWallpapers, 
    loading: uploadsLoading, 
    loadingMore: uploadsLoadingMore,
    error: uploadsError,
    hasMore: uploadsHasMore,
    loadMore: uploadsLoadMore,
    refresh: refreshUploads
  } = isOtherUser ? { 
    wallpapers: [], 
    loading: false, 
    loadingMore: false,
    error: null,
    hasMore: false,
    loadMore: () => {},
    refresh: () => {}
  } : myUploadsResult;

  // 获取关注列表
  const {
    users: followingUsers = [],
    loading: followingLoading,
    loadingMore: followingLoadingMore,
    error: followingError,
    hasMore: followingHasMore,
    loadMore: followingLoadMore,
    refresh: refreshFollowing
  } = useFollowingList();

  // 获取粉丝列表
  const {
    users: followersUsers = [],
    loading: followersLoading,
    loadingMore: followersLoadingMore,
    error: followersError,
    hasMore: followersHasMore,
    loadMore: followersLoadMore,
    refresh: refreshFollowers
  } = useFollowersList();

  // 根据当前Tab显示对应的数据（其他用户只显示上传）
  const displayLoading = activeTab === 'uploaded' ? uploadsLoading : favoritesLoading;
  const displayLoadingMore = activeTab === 'uploaded' ? uploadsLoadingMore : favoritesLoadingMore;
  const displayError = activeTab === 'uploaded' ? uploadsError : favoritesError;

  // 调试日志
  useEffect(() => {
    console.log('=== ProfilePage 调试 ===');
    console.log('followingUsers:', followingUsers);
    console.log('followingUsers 长度:', followingUsers.length);
    console.log('followersUsers:', followersUsers);
    console.log('followersUsers 长度:', followersUsers.length);
    console.log('activeTab:', activeTab);
    console.log('followingLoading:', followingLoading);
    console.log('followersLoading:', followersLoading);
    console.log('======================');
  }, [followingUsers, followersUsers, activeTab]);

  // 每次切换到关注或粉丝Tab时，重新请求数据
  useEffect(() => {
    if (activeTab === 'following') {
      refreshFollowing();
    } else if (activeTab === 'followers') {
      refreshFollowers();
    }
  }, [activeTab, refreshFollowing, refreshFollowers]);

  // 未登录状态 - 查看自己主页时直接跳转登录页
  useEffect(() => {
    const token = getAuthToken();
    const isViewingOwnProfile = !otherId; // 没有 otherId 表示查看自己的主页
    
    // 如果是查看自己的主页且未登录，直接跳转登录页
    if (isViewingOwnProfile && !token && !profileLoading) {
      // message.warning('请先登录后再访问');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
    }
  }, [profileLoading, otherId, navigate, message]);

  // 删除壁纸
  const handleDeleteWallpaper = async (id: number | string) => {
    Modal.confirm({
      title: t.profile.confirmDelete,
      content: t.profile.deleteWallpaperConfirm,
      okText: t.profile.confirmDeleteText,
      okType: 'danger',
      cancelText: t.profile.cancelText,
      onOk: async () => {
        setDeletingId(id);
        try {
          await deleteWallpaper(id);
          message.success(t.profile.deleteSuccess);
          // 刷新列表
          refreshUploads();
        } catch (err) {
          console.error('删除失败:', err);
          message.error(t.profile.deleteFailed);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // 关注/取消关注用户
  const handleToggleFollow = async (userId: number | string, currentIsFollowing: boolean) => {
    console.log(' [handleToggleFollow] 被调用');
    console.log('👤 userId:', userId, '类型:', typeof userId);
    console.log('👤 currentIsFollowing:', currentIsFollowing);
    
    setFollowingActionId(userId);
    try {
      console.log('📡 准备调用 toggleFollowUser，参数:', userId);
      await toggleFollowUser(userId);
      // 乐观更新UI
      message.success(currentIsFollowing ? t.profile.unfollowSuccess : t.profile.followSuccess);
      // 刷新列表
      if (activeTab === 'following') {
        refreshFollowing();
      } else if (activeTab === 'followers') {
        refreshFollowers();
      }
    } catch (err) {
      console.error('关注操作失败:', err);
      message.error(t.profile.followFailed);
    } finally {
      setFollowingActionId(null);
    }
  };

  // 未登录状态或加载中的渲染逻辑
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {!otherId ? (
          <div className="text-gray-500">
            <p>{t.common.loading}</p>
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            <p>{t.profile.pleaseLogin}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {t.profile.goToLogin}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white relative">
        {/* 返回按钮 - 查看他人主页时显示 */}
        {isOtherUser && (
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* 设置按钮 - 右上角 */}
        {!isOtherUser && (
          <button
            onClick={() => navigate('/settings')}
            className="absolute top-6 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <Settings size={20} />
          </button>
        )}
        
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border-4 border-white/30">
              <img
                src={profile.avatar_url || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname || profile.username)}`}
                alt={profile.nickname || profile.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile.nickname || profile.username}</h1>
              <div className="flex items-center gap-3 text-sm text-white/90">
                <span>{t.profile.level} {profile.level || 0}</span>
                {/* <span>•</span>
                <span>{profile.points || 0} {t.profile.points}</span> */}
              </div>
            </div>
            {/* 根据是否是其他用户显示关注/取消关注按钮 */}
            {isOtherUser && (
              <button
                onClick={async () => {
                  console.log(' [ProfilePage] 点击关注/取消关注按钮');
                  console.log('👤 profile.id:', profile.id, '类型:', typeof profile.id);
                  console.log('👤 profile:', profile);
                  
                  if (followingActionId) return;
                  setFollowingActionId(profile.id);
                  try {
                    console.log('📡 准备调用 toggleFollowUser，参数:', profile.id);
                    await toggleFollowUser(profile.id);
                    // 乐观更新
                    message.success((profile as any).is_following ? t.profile.unfollowSuccess : t.profile.followSuccess);
                    // 刷新用户信息
                    refreshProfile();
                  } catch (err) {
                    console.error('关注操作失败:', err);
                    message.error(t.profile.followFailed);
                  } finally {
                    setFollowingActionId(null);
                  }
                }}
                disabled={followingActionId === profile.id}
                className={`px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors ${
                  (profile as any).is_following
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-blue-600 hover:bg-white/90'
                }`}
              >
                {followingActionId === profile.id 
                  ? t.common.loading 
                  : (profile as any).is_following 
                  ? t.profile.unfollow 
                  : t.profile.follow}
              </button>
            )}
          </div>

          {/* 统计卡片 - 查看其他用户时显示所有4个 */}
          <div className="px-4 pt-6">
            <div className="space-y-3">
              {/* 第一行：已上传和收藏 */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              {/* 第二行：关注和粉丝 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users size={18} />
                    <span className="text-2xl font-bold">{profile.following_count ?? 0}</span>
                  </div>
                  <p className="text-xs text-white/80">{t.profile.following}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users size={18} />
                    <span className="text-2xl font-bold">{profile.follower_count ?? 0}</span>
                  </div>
                  <p className="text-xs text-white/80">{t.profile.followers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 上传按钮 - 只有自己的页面才显示 */}
      {!isOtherUser && (
        <div className="px-4 mt-4 mb-6">
          <Link
            to="/upload"
            className="profile-upload-btn flex items-center justify-center gap-2 w-full bg-white py-3.5 rounded-3xl no-underline text-blue-600 [&_svg]:shrink-0"
          >
            <Upload size={20} />
            <span className="font-semibold">{t.profile.uploadWallpaper}</span>
          </Link>
        </div>
      )}

      {/* Tabs - 只有自己的页面才显示Tab栏 */}
      {!isOtherUser && (
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
            <button
              onClick={() => setActiveTab('following')}
              className="flex-1 relative py-4 font-semibold transition-colors"
            >
              <span className={activeTab === 'following' ? 'text-blue-600' : 'text-gray-500'}>
                {t.profile.following}
              </span>
              {activeTab === 'following' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className="flex-1 relative py-4 font-semibold transition-colors"
            >
              <span className={activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500'}>
                {t.profile.followers}
              </span>
              {activeTab === 'followers' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="py-4">
        {/* 查看其他用户时，只显示上传列表 */}
        {isOtherUser ? (
          // 其他用户的上传列表
          <>
            {uploadedWallpapers.length > 0 && (
              <div className="px-4">
                <WallpaperGrid wallpapers={uploadedWallpapers} />
              </div>
            )}
          </>
        ) : activeTab === 'following' ? (
          // 关注列表
          <>
            {followingLoading ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-500">{t.common.loading}</div>
              </div>
            ) : followingError ? (
              <div className="px-4 py-16 text-center">
                <div className="text-red-500">{t.profile.loadFailedRetry}</div>
              </div>
            ) : followingUsers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {followingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* 头像 - 可点击跳转到用户主页 */}
                    <button
                      onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
                      className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100 hover:ring-blue-300 transition-all"
                    >
                      <img
                        src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.nickname || user.username || 'User') as string)}&background=random`}
                        alt={user.nickname || user.username}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    
                    {/* 用户信息 - 可点击跳转到用户主页 */}
                    <button
                      onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
                      className="flex-1 min-w-0 text-left hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 truncate text-base">
                        {user.nickname || user.username}
                      </h3>
                    </button>
                    
                    {/* 操作按钮 */}
                    <button
                      onClick={() => handleToggleFollow(user.id, true)}
                      disabled={followingActionId === user.id}
                      className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all active:scale-95 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {followingActionId === user.id
                        ? t.common.loading
                        : t.profile.unfollow}
                    </button>
                  </div>
                ))}
                {/* 加载更多 */}
                {followingHasMore && (
                  <div className="px-4 py-6 text-center">
                    <button
                      onClick={followingLoadMore}
                      disabled={followingLoadingMore}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {followingLoadingMore ? t.common.loading : t.profile.loadMoreText}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.profile.noFollowingYet}
                </h3>
                <p className="text-gray-500">
                  {t.profile.startFollowing}
                </p>
              </div>
            )}
          </>
        ) : activeTab === 'followers' ? (
          // 粉丝列表
          <>
            {followersLoading ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-500">{t.common.loading}</div>
              </div>
            ) : followersError ? (
              <div className="px-4 py-16 text-center">
                <div className="text-red-500">{t.profile.loadFailedRetry}</div>
              </div>
            ) : followersUsers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {followersUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* 头像 - 可点击跳转到用户主页 */}
                    <button
                      onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
                      className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100 hover:ring-blue-300 transition-all"
                    >
                      <img
                        src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.nickname || user.username || 'User') as string)}&background=random`}
                        alt={user.nickname || user.username}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    
                    {/* 用户信息 - 可点击跳转到用户主页 */}
                    <button
                      onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
                      className="flex-1 min-w-0 text-left hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 truncate text-base">
                        {user.nickname || user.username}
                      </h3>
                    </button>
                    
                    {/* 操作按钮 */}
                    <button
                      onClick={() => handleToggleFollow(user.id, user.is_followed || false)}
                      disabled={followingActionId === user.id}
                      className={`px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all active:scale-95 ${
                        user.is_followed
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {followingActionId === user.id
                        ? t.common.loading
                        : user.is_followed
                        ? t.profile.mutualFollow
                        : t.profile.followBack}
                    </button>
                  </div>
                ))}
                {/* 加载更多 */}
                {followersHasMore && (
                  <div className="px-4 py-6 text-center">
                    <button
                      onClick={followersLoadMore}
                      disabled={followersLoadingMore}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {followersLoadingMore ? t.common.loading : t.profile.loadMoreText}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.profile.noFollowersYet}
                </h3>
                <p className="text-gray-500">
                  {t.profile.startFollowing}
                </p>
              </div>
            )}
          </>
        ) : activeTab === 'uploaded' ? (
          // 上传列表
          <>
            {uploadsLoading ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-500">{t.common.loading}</div>
              </div>
            ) : uploadsError ? (
              <div className="px-4 py-16 text-center">
                <div className="text-red-500">{t.profile.loadFailedRetry}</div>
              </div>
            ) : uploadedWallpapers.length > 0 ? (
              <>
                <UploadWallpaperGrid 
                  wallpapers={uploadedWallpapers} 
                  onDelete={(id) => handleDeleteWallpaper(id)}
                  deletingId={deletingId}
                />
                {/* 加载更多 */}
                {uploadsHasMore && (
                  <div className="px-4 py-6 text-center">
                    <button
                      onClick={uploadsLoadMore}
                      disabled={uploadsLoadingMore}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {uploadsLoadingMore ? t.common.loading : t.profile.loadMoreText}
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
                <div className="text-red-500">{t.profile.loadFailedRetry}</div>
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
                      {favoritesLoadingMore ? t.common.loading : t.profile.loadMoreText}
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