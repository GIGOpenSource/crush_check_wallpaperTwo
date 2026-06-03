import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { getUnreadNotificationCount } from '../../api/wallpaper';
import { getAuthToken, addTokenChangeListener } from '../../api/request';

interface UnreadCountContextType {
  unreadCount: number;
  actualUnreadCount: number;
  loading: boolean;
  refresh: () => void;
  clear: () => void;
}

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [actualUnreadCount, setActualUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      setActualUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getUnreadNotificationCount();
      // 小红点使用 count 字段
      const count = response?.data?.count ?? 0;
      setUnreadCount(count);
      // 消息页面显示使用 actual_count 字段
      const actualCount = response?.data?.actual_count ?? response?.data?.count ?? 0;
      setActualUnreadCount(actualCount);
    } catch (err) {
      console.error('获取未读消息数量失败:', err);
      setUnreadCount(0);
      setActualUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const clear = useCallback(() => {
    setUnreadCount(0);
    setActualUnreadCount(0);
  }, []);

  // 初始化
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      setActualUnreadCount(0);
    } else {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // 监听 token 变化
  useEffect(() => {
    const unsubscribe = addTokenChangeListener((hasToken) => {
      if (!hasToken) {
        setUnreadCount(0);
        setActualUnreadCount(0);
      } else {
        fetchUnreadCount();
      }
    });
    return unsubscribe;
  }, [fetchUnreadCount]);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, actualUnreadCount, loading, refresh, clear }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
}