import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, UserPlus } from 'lucide-react';
import { useFollowersList } from '../hooks/useFollowingList';
import { toggleFollowUser } from '../../api/wallpaper';

export default function DesktopFollowersPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { users = [], loading, loadingMore, error, hasMore, loadMore, refresh } = useFollowersList();

  // 每次进入页面时重新请求数据
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 处理关注/取消关注
  const handleToggleFollow = async (userId: number | string) => {
    try {
      await toggleFollowUser(userId);
      // 刷新列表
      refresh();
    } catch (err) {
      console.error('操作失败:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">{t.profile.followers}</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="py-16 text-center">
                <p className="text-gray-500">{t.common.loading}</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={refresh}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {t.common.retry}
                </button>
              </div>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}?other_id=${user.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100 hover:ring-blue-300 transition-all">
                        <img
                          src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || user.username || '')}`}
                          alt={user.nickname || user.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate mb-1 hover:text-blue-600 transition-colors w-full text-left">
                          {user.nickname || user.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                          <span>{user.upload_count || 0} {t.profile.uploaded}</span>
                          <span>•</span>
                          <span>{user.follower_count || 0} {t.profile.followers}</span>
                        </div>

                        {/* Follow Button - Stop propagation to prevent card click */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFollow(user.id);
                          }}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            user.is_following
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {user.is_followed ? t.profile.mutualFollow : t.profile.followBack}
                        </button>
                      </div>
                    </div>
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
                <p className="text-gray-500 mb-8">
                  {t.profile.startFollowing}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={20} />
                  <span>{t.home.discoverWallpapers}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
