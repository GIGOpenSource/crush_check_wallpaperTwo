import { useCallback, useEffect, useRef, useState } from 'react';
import { getWallpapersList } from '../../api/wallpaper';
import { useView } from '../contexts/ViewContext';
import type { Wallpaper } from '../types';
import {
  extractWallpaperItemsFromResponse,
  mapRecordToWallpaper,
  wallpaperListCoverUrl,
} from '../utils/wallpaperApiMap';

const PAGE_SIZE = 20;

type PlatformKey = 'PC' | 'PHONE';

type CacheKey = `${PlatformKey}_${'home' | 'hot'}`;

type HomePopularSnapshot = {
  wallpapers: Wallpaper[];
  page: number;
  hasMore: boolean;
  ready: boolean;
};

/** 跨路由保留列表数据，避免从详情返回时重复请求首屏 */
const homePopularCache: Partial<Record<CacheKey, HomePopularSnapshot>> = {};

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

function mapResponse(raw: unknown): Wallpaper[] {
  const items = extractWallpaperItemsFromResponse(raw);
  return items.map(mapRecordToWallpaper).filter((w) => w.id && wallpaperListCoverUrl(w));
}

type UseHomePopularOptions = {
  /** 为 false 时不请求（例：桌面端首页只要 Banner、不要热门接口） */
  enabled?: boolean;
  /** 是否为热门路由，为 true 时添加 order='hot' 参数 */
  isHotRoute?: boolean;
};

export function useHomePopularWallpapers(options?: UseHomePopularOptions) {
  const { viewMode } = useView();
  const platform: PlatformKey = viewMode === 'mobile' ? 'PHONE' : 'PC';
  const enabled = options?.enabled !== false;
  const isHotRoute = options?.isHotRoute === true;

  // 生成缓存键：区分首页和热门路由
  const cacheKey: CacheKey = `${platform}_${isHotRoute ? 'hot' : 'home'}`;

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    return homePopularCache[cacheKey]?.wallpapers ?? [];
  });
  const [loading, setLoading] = useState(() => {
    if (options?.enabled === false) return false;
    return !homePopularCache[cacheKey]?.ready;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return homePopularCache[cacheKey]?.hasMore ?? true;
  });
  const [error, setError] = useState(false);

  const pageRef = useRef(homePopularCache[cacheKey]?.page ?? 1);
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** 有缓存则恢复；无缓存或切换 platform/route 时拉第一页 */
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    const cached = homePopularCache[cacheKey];
    if (cached?.ready) {
      pageRef.current = cached.page;
      setWallpapers(cached.wallpapers);
      setHasMore(cached.hasMore);
      setError(false);
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    let cancelled = false;
    pageRef.current = 1;
    setWallpapers([]);
    setHasMore(true);
    setLoading(true);
    setError(false);
    fetchingRef.current = true;

    getWallpapersList({
      currentPage: 1,
      pageSize: PAGE_SIZE,
      platform,
      media_live: false,
      order: isHotRoute ? 'hot' : 'home',
    })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapResponse(raw);
        const nextHasMore = mapped.length >= PAGE_SIZE;
        setWallpapers(mapped);
        setHasMore(nextHasMore);
        homePopularCache[cacheKey] = {
          wallpapers: mapped,
          page: 1,
          hasMore: nextHasMore,
          ready: true,
        };
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setWallpapers([]);
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
  }, [platform, enabled, isHotRoute]);

  const loadNextPage = useCallback(() => {
    if (!enabled || !hasMore || loading || loadingMore || error || fetchingRef.current) return;

    const nextPage = pageRef.current + 1;
    fetchingRef.current = true;
    setLoadingMore(true);

    getWallpapersList({
      currentPage: nextPage,
      pageSize: PAGE_SIZE,
      platform,
      media_live: false,
      order: isHotRoute ? 'hot' : 'home',
    })
      .then((raw) => {
        const mapped = mapResponse(raw);
        if (mapped.length === 0) {
          setHasMore(false);
          setWallpapers((prev) => {
            homePopularCache[cacheKey] = {
              ready: true,
              wallpapers: prev,
              page: pageRef.current,
              hasMore: false,
            };
            return prev;
          });
          return;
        }
        const hasMoreNext = mapped.length >= PAGE_SIZE;
        pageRef.current = nextPage;
        setWallpapers((prev) => {
          const merged = mergeDedupe(prev, mapped);
          homePopularCache[cacheKey] = {
            ready: true,
            wallpapers: merged,
            page: nextPage,
            hasMore: hasMoreNext,
          };
          return merged;
        });
        setHasMore(hasMoreNext);
      })
      .catch(() => {
        setHasMore(false);
      })
      .finally(() => {
        fetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [enabled, hasMore, loading, loadingMore, error, platform, isHotRoute]);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el || loading || error || !hasMore || loadingMore) return;

    const ob = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) loadNextPage();
      },
      { root: null, rootMargin: '160px', threshold: 0 },
    );

    ob.observe(el);
    return () => ob.disconnect();
  }, [enabled, loading, error, hasMore, loadingMore, loadNextPage, wallpapers.length]);

  return {
    wallpapers,
    loading,
    loadingMore,
    error,
    hasMore,
    sentinelRef,
  };
}
