import type { WallpapersListParams } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getWallpapersList } from '../../api/wallpaper';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

export type SearchFilters = {
  resolution: string[];
  aspectRatio: string[];
};

type SearchSnapshot = {
  wallpapers: Wallpaper[];
  page: number;
  hasMore: boolean;
  totalCount: number;
  ready: boolean;
};

const MAX_SEARCH_CACHE = 5;

/** 跨路由保留搜索结果，避免切 tab 返回时重复请求 */
const searchCache = new Map<string, SearchSnapshot>();
const cacheOrder: string[] = [];

function getCacheKey(
  query: string,
  filters: SearchFilters,
  platform: 'PC' | 'PHONE',
): string {
  return [
    query.trim(),
    filters.resolution.join(','),
    filters.aspectRatio.join(','),
    platform,
  ].join('|');
}

function putCache(key: string, snapshot: SearchSnapshot) {
  if (!searchCache.has(key)) {
    // 新 key，FIFO 淘汰最旧的
    if (cacheOrder.length >= MAX_SEARCH_CACHE) {
      const oldest = cacheOrder.shift();
      if (oldest) searchCache.delete(oldest);
    }
    cacheOrder.push(key);
  }
  searchCache.set(key, snapshot);
}

export function useSearchWallpapers(
  query: string,
  filters: SearchFilters,
  initialPage: number = 1,
  pageSize: number = 20,
  platform: 'PC' | 'PHONE' = 'PHONE',
) {
  const cacheKey = useMemo(
    () => getCacheKey(query, filters, platform),
    [query, filters, platform],
  );

  const cached = searchCache.get(cacheKey);

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    return cached?.wallpapers ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return !cached?.ready;
  });
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return cached?.hasMore ?? true;
  });
  const [totalCount, setTotalCount] = useState(() => {
    return cached?.totalCount ?? 0;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return cached?.page ?? initialPage;
  });

  const pageRef = useRef(cached?.page ?? initialPage);
  const fetchingRef = useRef(false);

  /** 构建首页请求参数 */
  const buildFirstPageParams = useCallback((): WallpapersListParams => {
    const params: WallpapersListParams = {
      currentPage: 1,
      pageSize,
      platform,
    };
    if (query.trim()) {
      params.name = query.trim();
      params.tag_name = query.trim();
    }
    if (filters.resolution.length > 0) {
      params.resolution = filters.resolution.join(',');
    }
    if (filters.aspectRatio.length > 0) {
      params.aspect_ratio = filters.aspectRatio.join(',');
    }
    return params;
  }, [query, filters, platform, pageSize]);

  /** 有缓存则恢复；无缓存或查询条件变化时拉取第一页 */
  useEffect(() => {
    const hit = searchCache.get(cacheKey);
    if (hit?.ready) {
      pageRef.current = hit.page;
      setWallpapers(hit.wallpapers);
      setHasMore(hit.hasMore);
      setTotalCount(hit.totalCount);
      setCurrentPage(hit.page);
      setError(false);
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    pageRef.current = 1;
    setWallpapers([]);
    setHasMore(true);
    setError(false);
    setLoading(true);

    let cancelled = false;

    getWallpapersList(buildFirstPageParams())
      .then((raw) => {
        if (cancelled) return;
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);
        const totalItems = (raw as any)?.total || (raw as any)?.count || items.length;
        const nextHasMore = items.length === pageSize;

        setWallpapers(items);
        setHasMore(nextHasMore);
        setTotalCount(totalItems);
        setCurrentPage(1);
        putCache(cacheKey, {
          wallpapers: items,
          page: 1,
          hasMore: nextHasMore,
          totalCount: totalItems,
          ready: true,
        });
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
  }, [cacheKey, buildFirstPageParams, pageSize]);

  /** 加载更多：直接发请求并追加，同步更新缓存 */
  const loadMore = useCallback(() => {
    if (!hasMore || loading || fetchingRef.current) return;

    const nextPage = pageRef.current + 1;
    fetchingRef.current = true;
    setLoading(true);

    const params: WallpapersListParams = {
      ...buildFirstPageParams(),
      currentPage: nextPage,
    };

    let cancelled = false;

    getWallpapersList(params)
      .then((raw) => {
        if (cancelled) return;
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);
        const nextHasMore = items.length === pageSize;

        pageRef.current = nextPage;
        setCurrentPage(nextPage);
        setWallpapers((prev) => {
          const merged = [...prev, ...items];
          const hit = searchCache.get(cacheKey);
          if (hit) {
            putCache(cacheKey, {
              ...hit,
              wallpapers: merged,
              page: nextPage,
              hasMore: nextHasMore,
            });
          }
          return merged;
        });
        setHasMore(nextHasMore);
      })
      .catch(() => {
        setHasMore(false);
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
  }, [hasMore, loading, cacheKey, buildFirstPageParams, pageSize]);

  /** 刷新：清除当前查询的缓存并重新加载第一页 */
  const refresh = useCallback(() => {
    searchCache.delete(cacheKey);
    const idx = cacheOrder.indexOf(cacheKey);
    if (idx >= 0) cacheOrder.splice(idx, 1);

    fetchingRef.current = true;
    pageRef.current = 1;
    setWallpapers([]);
    setHasMore(true);
    setError(false);
    setLoading(true);

    let cancelled = false;

    getWallpapersList(buildFirstPageParams())
      .then((raw) => {
        if (cancelled) return;
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);
        const totalItems = (raw as any)?.total || (raw as any)?.count || items.length;
        const nextHasMore = items.length === pageSize;

        setWallpapers(items);
        setHasMore(nextHasMore);
        setTotalCount(totalItems);
        setCurrentPage(1);
        putCache(cacheKey, {
          wallpapers: items,
          page: 1,
          hasMore: nextHasMore,
          totalCount: totalItems,
          ready: true,
        });
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
  }, [cacheKey, buildFirstPageParams, pageSize]);

  return {
    wallpapers,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refresh,
  };
}
