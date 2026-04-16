import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyCollections } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import { 
  mapRecordToWallpaper, 
  extractWallpaperItemsFromResponse, 
  wallpaperListCoverUrl 
} from '../utils/wallpaperApiMap';
import { useView } from '../contexts/ViewContext';

const PAGE_SIZE = 20;

/** 合并并去重壁纸列表 */
function mergeDedupe(prev: Wallpaper[], batch: Wallpaper[]): Wallpaper[] {
  const ids = new Set(prev.map((w) => w.id));
  const out = [...prev];
  for (const w of batch) {
    if (!ids.has(w.id)) {
      ids.add(w.id);
      out.push(w);
    }
  }
  return out;
}

/** 映射 API 响应到 Wallpaper 数组 */
function mapResponse(raw: unknown): Wallpaper[] {
  const items = extractWallpaperItemsFromResponse(raw);
  if (!items || !Array.isArray(items)) return [];
  
  return items
    .map((item) => {
      if (!item) return undefined;
      // 处理嵌套的 wallpaper 字段（收藏记录中可能包含 wallpaper 对象）
      const wallpaperData = item.wallpaper && typeof item.wallpaper === 'object' && !Array.isArray(item.wallpaper)
        ? (item.wallpaper as Record<string, unknown>)
        : item;
      return mapRecordToWallpaper(wallpaperData);
    })
    .filter((w): w is Wallpaper => w !== undefined && w.id !== undefined && wallpaperListCoverUrl(w) !== undefined);
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
 * 获取用户收藏列表
 */
export function useMyCollections() {
  const { viewMode } = useView();
  const platform: 'PHONE' | 'PC' = viewMode === 'mobile' ? 'PHONE' : 'PC';
  // 直接使用 platform 初始化 ref，不再通过 useEffect 更新
  const platformRef = useRef(platform);

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
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
    pageRef.current = 1;
    setWallpapers([]);
    setTotal(undefined);
    setHasMore(true);
    setLoading(true);
    setError(false);
    fetchingRef.current = true;

    getMyCollections({
      currentPage: 1,
      pageSize: PAGE_SIZE,
      platform: platformRef.current,
    })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapResponse(raw);
        setWallpapers(mapped);
        setTotal(pickTotal(raw));
        setHasMore(mapped.length >= PAGE_SIZE);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setWallpapers([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          fetchingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 使用 ref 存储 loadFirstPage 的最新引用
  const loadFirstPageRef = useRef(loadFirstPage);
  useEffect(() => {
    loadFirstPageRef.current = loadFirstPage;
  }, [loadFirstPage]);

  /** 加载更多 */
  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || error || fetchingRef.current) return;

    const nextPage = pageRef.current + 1;
    fetchingRef.current = true;
    setLoadingMore(true);

    getMyCollections({
      currentPage: nextPage,
      pageSize: PAGE_SIZE,
      platform: platformRef.current,
    })
      .then((raw) => {
        const mapped = mapResponse(raw);
        if (mapped.length === 0) {
          setHasMore(false);
          return;
        }
        pageRef.current = nextPage;
        setWallpapers((prev) => mergeDedupe(prev, mapped));
        setHasMore(mapped.length >= PAGE_SIZE);
        const t = pickTotal(raw);
        if (t != null) setTotal(t);
      })
      .catch(() => setHasMore(false))
      .finally(() => {
        fetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, loading, loadingMore, error]);

  /** 刷新数据 */
  const refresh = useCallback(() => {
    loadFirstPageRef.current();
  }, []);

  // 首次加载 - 每次组件挂载时执行
  useEffect(() => {
    loadFirstPageRef.current();
  }, []);

  return {
    wallpapers,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
