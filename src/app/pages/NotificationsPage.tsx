import { Bell, Lock, Trash2, Check, CheckCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api/wallpaper';
import { App, Modal } from 'antd';
import { getAuthToken } from '../../api/request';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 辅助函数：处理带参数的翻译
 * 例如：t('notifications.minutesAgo', { count: 5 }) => "5分钟前"
 */
function translateWithParams(
  t: any,
  key: string,
  params?: Record<string, any>
): string {
  const keys = key.split('.');
  let value: any = t;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 找不到翻译时返回 key
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // 如果有参数，进行替换
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  
  return value;
}

/**
 * 消息列表页面 - 移动端
 */
export default function MobileNotificationsPage() {
  const navigate = useNavigate();
  const token = getAuthToken();
  const { t } = useLanguage();
  
  // 封装带参数的翻译函数
  const tr = (key: string, params?: Record<string, any>) => 
    translateWithParams(t, key, params);
  
  // 如果未登录，显示需要登录的提示
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 max-w-md mx-auto">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.notifications.title}
            </h1>
          </div>
        </div>

        {/* 未登录提示 */}
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t.notifications.loginRequired}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            {t.notifications.loginPrompt}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            {t.notifications.goToLogin}
          </button>
        </div>

        <BottomNav />
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
    if (diffMins < 60) return tr('notifications.minutesAgo', { count: diffMins });
    if (diffHours < 24) return tr('notifications.hoursAgo', { count: diffHours });
    if (diffDays < 7) return tr('notifications.daysAgo', { count: diffDays });
    return date.toLocaleDateString('zh-CN');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.notifications.title}
            </h1>
            {total !== undefined && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({tr('notifications.messagesCount', { count: total })})
              </span>
            )}
          </div>
        </div>
        
        {/* 未读数量和全部已读按钮 */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? tr('notifications.unreadMessages', { count: unreadCount }) : t.notifications.allRead}
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

      {/* 消息列表 */}
      <div className="px-4 py-4">
        {loading ? (
          // 加载状态
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // 错误状态
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-5xl mb-3">⚠️</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{t.notifications.loadFailed}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t.notifications.retry}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          // 空状态
          <div className="text-center py-12">
            <div className="text-gray-300 dark:text-gray-700 text-5xl mb-3">🔔</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.notifications.noNotifications}</p>
          </div>
        ) : (
          // 消息列表
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const isUnread = !notification.is_read;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-3 border transition-all active:scale-[0.98] ${
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {(notification.sender?.nickname || t.notifications.systemNotification)[0]}
                      </div>
                    )}

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* 第一行：标题（大字）+ 未读蓝点 */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.sender?.nickname || notification.title || t.notifications.systemNotification}
                            </h3>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          
                          {/* 第二行：内容（小字）*/}
                          {(() => {
                            const type = notification.notification_type;
                            // 如果是 system, feature, activity 类型，显示 extra_data.content
                            if ((type === 'system' || type === 'feature' || type === 'activity') && notification.extra_data?.content) {
                              return (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                  {notification.extra_data.content}
                                </p>
                              );
                            }
                            // 如果是 like, reply, comment 类型，显示 extra_data 内容
                            if ((type === 'like' || type === 'reply' || type === 'comment') && notification.extra_data) {
                              const content = notification.extra_data.reply_content || notification.extra_data.content || '';
                              if (content) {
                                return (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                    {content}
                                  </p>
                                );
                              }
                            }
                            // 如果没有 extra_data，显示 content_display
                            if (notification.content_display) {
                              return (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                  {notification.content_display}
                                </p>
                              );
                            }
                            return null;
                          })()}
                          
                          {/* 时间 */}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 pl-2">
                          <div className="flex gap-1">
                            {isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={processingId === notification.id}
                                className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors disabled:opacity-50"
                                aria-label={t.notifications.markAsRead}
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              disabled={processingId === notification.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors disabled:opacity-50"
                              aria-label={t.notifications.deleteMessage}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loadingMore ? t.notifications.loading : t.notifications.loadMore}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
