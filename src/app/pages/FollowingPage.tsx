import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, UserPlus } from 'lucide-react';
import { useFollowingList } from '../hooks/useFollowingList';
import { toggleFollowUser } from '../../api/wallpaper';

export default function FollowingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { message } = App.useApp();
  const { users = [], loading, loadingMore, error, hasMore, loadMore, refresh } = useFollowingList();

  // 每次进入页面时重新请求数据
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 处理取消关注
  const handleToggleFollow = async (userId: number | string) => {
    try {
      await toggleFollowUser(userId);
      // 显示成功提示
      message.success(t.profile.unfollowSuccess);
      // 刷新列表
      refresh();
    } catch (err) {
      console.error('操作失败:', err);
      message.error(t.profile.followFailed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t.profile.following}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="py-4">
        {loading ? (
          <div className="px-4 py-16 text-center">
            <div className="text-gray-500">{t.common.loading}</div>
          </div>
        ) : error ? (
          <div className="px-4 py-16 text-center">
            <div className="text-red-500">{error}</div>
            <button
              onClick={refresh}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              {t.common.retry}
            </button>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100 hover:ring-blue-300 transition-all">
                  <img
                    src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || user.username || '')}`}
                    alt={user.nickname || user.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                    {user.nickname || user.username || 'Unknown'}
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{user.upload_count || 0} {t.profile.uploaded}</span>
                    <span>•</span>
                    <span>{user.follower_count || 0} {t.profile.followers}</span>
                  </div>
                </div>

                {/* Follow Button - Stop propagation to prevent card click */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollow(user.id);
                  }}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {t.profile.unfollow}
                </button>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="px-4 py-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loadingMore ? t.common.loading : t.common.loadMore}
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
            <p className="text-gray-500 mb-6">
              {t.profile.startFollowing}
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} />
              <span>{t.home.discoverWallpapers}</span>
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
