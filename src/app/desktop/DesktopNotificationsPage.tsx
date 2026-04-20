import { Bell, Lock, Trash2, Check, CheckCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api/wallpaper';
import { App, Modal } from 'antd';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { getAuthToken } from '../../api/request';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 消息列表页面 - 桌面版
 */
export default function DesktopNotificationsPage() {
  const navigate = useNavigate();
  const token = getAuthToken();
  const { t } = useLanguage();
  
  // 如果未登录，显示需要登录的提示
  if (!token) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DesktopSidebar />
        
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t.notifications.loginRequired}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {t.notifications.loginPrompt}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              {t.notifications.goToLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 已登录，正常显示消息列表
  const { notifications, loading, loadingMore, hasMore, loadMore, refresh, total, error } = useNotifications();
  const { refresh: refreshUnreadCount, unreadCount } = useUnreadCount();
  const { message } = App.useApp();
  const [processingId, setProcessingId] = useState<number | string | null>(null);

  // 格式化时间
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.notifications.justNow;
    if (diffMins < 60) return t.notifications.minutesAgo.replace('{{count}}', String(diffMins));
    if (diffHours < 24) return t.notifications.hoursAgo.replace('{{count}}', String(diffHours));
    if (diffDays < 7) return t.notifications.daysAgo.replace('{{count}}', String(diffDays));
    return date.toLocaleDateString();
  };

  // 标记为已读
  const handleMarkAsRead = async (notificationId: number | string) => {
    if (processingId === notificationId) return;
    
    setProcessingId(notificationId);
    try {
      await markNotificationAsRead(notificationId);
      refresh();
      refreshUnreadCount();
      message.success(t.notifications.markAsReadSuccess);
    } catch (err) {
      console.error('标记已读失败:', err);
      message.error(t.notifications.operationFailed);
    } finally {
      setProcessingId(null);
    }
  };

  // 标记所有为已读
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refresh();
      refreshUnreadCount();
      message.success(t.notifications.markAllAsReadSuccess);
    } catch (err) {
      console.error('标记全部已读失败:', err);
      message.error(t.notifications.operationFailed);
    }
  };

  // 删除消息
  const handleDelete = (notificationId: number | string) => {
    Modal.confirm({
      title: t.notifications.confirmDelete,
      content: t.notifications.deleteMessageConfirm,
      okText: t.notifications.deleteConfirmText,
      cancelText: t.notifications.cancelText,
      okButtonProps: { danger: true },
      onOk: async () => {
        if (processingId === notificationId) return;
        
        setProcessingId(notificationId);
        try {
          await deleteNotification(notificationId);
          refresh();
          refreshUnreadCount();
          message.success(t.notifications.deleteSuccess);
        } catch (err) {
          console.error('删除失败:', err);
          message.error(t.notifications.deleteFailed);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMore();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* 顶部导航 */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              {/* 标题区域 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-500" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t.notifications.title}
                  </h1>
                  {total !== undefined && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({t.notifications.messagesCount.replace('{{count}}', String(total))})
                    </span>
                  )}
                </div>
              </div>
              
              {/* 未读数量和全部已读按钮 */}
              <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 
                    ? t.notifications.unreadMessages.replace('{{count}}', String(unreadCount))
                    : t.notifications.allRead
                  }
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {t.notifications.markAllAsRead}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 消息列表 */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              // 加载状态
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // 错误状态
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">⚠️</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t.notifications.loadFailed}</p>
                <button
                  onClick={refresh}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t.notifications.retry}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              // 空状态
              <div className="text-center py-12">
                <div className="text-gray-300 dark:text-gray-700 text-6xl mb-4">🔔</div>
                <p className="text-gray-500 dark:text-gray-400">{t.notifications.noNotifications}</p>
              </div>
            ) : (
              // 消息列表
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  const isUnread = !notification.is_read;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all ${
                        isUnread
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* 头像 */}
                        {notification.sender?.avatar_url ? (
                          <img
                            src={notification.sender.avatar_url}
                            alt={notification.sender.nickname}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-avatar.png';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {(notification.sender?.nickname || t.notifications.systemNotification)[0]}
                          </div>
                        )}

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* 第一行：昵称 + 未读蓝点 */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                                  {notification.sender?.nickname || notification.title || t.notifications.systemNotification}
                                </h3>
                                {isUnread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              
                              {/* 第一行：显示 extra_data.reply_content */}
                              {(() => {
                                const type = notification.notification_type;
                                if ((type === 'like' || type === 'reply' || type === 'comment') && notification.extra_data) {
                                  const replyContent = notification.extra_data.reply_content || notification.extra_data.content || '';
                                  if (replyContent) {
                                    return (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                        {replyContent}
                                      </p>
                                    );
                                  }
                                }
                                return null;
                              })()}
                              
                              {/* 第二行：显示 content_display */}
                              {notification.content_display && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-1">
                                  {notification.content_display}
                                </p>
                              )}
                              
                              {/* 时间 */}
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={processingId === notification.id}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
                                  title="标记为已读"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                disabled={processingId === notification.id}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                                title="删除消息"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* 加载更多 */}
                {hasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? t.common.loading :  t.common.loadMore}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
