import { useCallback, useEffect, useState } from 'react';
import { getNotificationsList, getNotificationSettings, updateNotificationSettings } from '../../api/wallpaper';
import type { NotificationItem, NotificationSettings } from '../../api/wallpaper';
import { message } from 'antd';

const PAGE_SIZE = 20;

/** 合并并去重消息列表 */
function mergeDedupe(prev: NotificationItem[], batch: NotificationItem[]): NotificationItem[] {
  const ids = new Set(prev.map((n) => n.id));
  const out = [...prev];
  for (const n of batch) {
    if (!ids.has(n.id)) {
      ids.add(n.id);
      out.push(n);
    }
  }
  return out;
}

/** 映射 API 响应到消息数组 */
function mapResponse(raw: unknown): NotificationItem[] {
  if (raw == null || typeof raw !== 'object') return [];
  const data = raw as Record<string, unknown>;
  
  // 尝试从 data.results 获取
  if (Array.isArray(data.results)) {
    return data.results as NotificationItem[];
  }
  
  // 尝试从 data.list 获取
  if (Array.isArray(data.list)) {
    return data.list as NotificationItem[];
  }
  
  // 尝试从 data.data 获取
  const nested = data.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    if (Array.isArray(inner.results)) return inner.results as NotificationItem[];
    if (Array.isArray(inner.list)) return inner.list as NotificationItem[];
  }
  
  return [];
}

/** 获取总数 */
function pickTotal(raw: unknown): number | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  
  // 尝试从 data.pagination.total 获取
  const data = o.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const pagination = (data as Record<string, unknown>).pagination;
    if (pagination && typeof pagination === 'object') {
      const total = (pagination as Record<string, unknown>).total;
      if (typeof total === 'number' && !Number.isNaN(total)) return total;
    }
  }
  
  // 兼容其他格式
  const top = o.total ?? o.count;
  if (typeof top === 'number' && !Number.isNaN(top)) return top;
  
  return undefined;
}

/**
 * 获取消息列表
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  /** 加载首页数据 */
  const loadFirstPage = useCallback(() => {
    let cancelled = false;
    fetchingRef.current = true;
    pageRef.current = 1;
    setLoading(true);
    setError(false);

    getNotificationsList({ currentPage: 1, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const list = mapResponse(res);
        setNotifications(list);
        setTotal(pickTotal(res));
        setHasMore(list.length >= PAGE_SIZE);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      })
      .finally(() => {
        if (!cancelled) fetchingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** 加载下一页数据 */
  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMore) return;
    
    let cancelled = false;
    fetchingRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    getNotificationsList({ currentPage: nextPage, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const list = mapResponse(res);
        setNotifications((prev) => mergeDedupe(prev, list));
        setTotal(pickTotal(res));
        setHasMore(list.length >= PAGE_SIZE);
        if (list.length > 0) {
          pageRef.current = nextPage;
        }
      })
      .catch(() => {
        if (cancelled) return;
        // 失败时不增加页码，允许重试
      })
      .finally(() => {
        if (!cancelled) {
          fetchingRef.current = false;
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasMore]);

  /** 刷新消息列表 */
  const refresh = useCallback(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // 首次挂载时加载数据
  useEffect(() => {
    const cancel = loadFirstPage();
    return () => {
      cancel?.();
    };
  }, [loadFirstPage]);

  return {
    notifications,
    total,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

/**
 * 通知设置管理 Hook
 * 提供获取和修改通知设置的功能，支持乐观更新和错误回滚
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  /** 获取通知设置 */
  const fetchSettings = useCallback(() => {
    setLoading(true);
    getNotificationSettings()
      .then((response) => {
        // API返回完整结构: { code, message, data }
        // 需要手动解包 data 字段
        const data = (response as any)?.data ?? response;
        setSettings(data);
      })
      .catch((error) => {
        console.error('获取通知设置失败:', error);
        message.error('获取通知设置失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * 更新单个通知设置项
   * @param key - 设置项的key
   * @param value - 新的值
   */
  const updateSetting = useCallback(
    async (key: keyof NotificationSettings, value: boolean) => {
      if (!settings) return;

      // 保存旧状态用于回滚
      const oldValue = settings[key];
      
      // 乐观更新UI
      setSettings((prev) => {
        if (!prev) return prev;
        return { ...prev, [key]: value };
      });

      // 标记正在更新
      setUpdating((prev) => ({ ...prev, [key]: true }));

      try {
        // 发起API请求
        const response = await updateNotificationSettings({ [key]: value });
        
        // API返回完整结构: { code, message, data }
        // 使用返回的最新数据更新本地状态
        const data = (response as any)?.data ?? response;
        if (data) {
          setSettings(data);
        }
        
        // 成功：保持当前状态
        message.success('设置已更新');
      } catch (error) {
        console.error('更新通知设置失败:', error);
        
        // 失败：回滚到之前的状态
        setSettings((prev) => {
          if (!prev) return prev;
          return { ...prev, [key]: oldValue };
        });
        
        message.error('设置失败，请重试');
      } finally {
        // 清除更新状态
        setUpdating((prev) => ({ ...prev, [key]: false }));
      }
    },
    [settings]
  );

  /** 刷新设置 */
  const refresh = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 初始加载
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updating,
    updateSetting,
    refresh,
  };
}
