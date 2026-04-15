import { useCallback, useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '../../api/wallpaper';
import { getAuthToken } from '../../api/request';

/**
 * 获取未读消息数量
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    // 如果未登录，不调用接口
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getUnreadNotificationCount();
      // 后端返回格式: { code: 200, message: "success", data: { count: 7 } }
      const count = response?.data?.count ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('获取未读消息数量失败:', err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 刷新未读数量
  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refresh };
}