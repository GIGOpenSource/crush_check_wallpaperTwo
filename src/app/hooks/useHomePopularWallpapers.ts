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

type HomePopularSnapshot = {
  wallpapers: Wallpaper[];
  page: number;
  hasMore: boolean;
  ready: boolean;
};

/** 跨路由保留首页热门列表，避免从详情返回时重复请求首屏 */
const homePopularCache: Partial<Record<PlatformKey, HomePopularSnapshot>> = {};

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
};

export function useHomePopularWallpapers(options?: UseHomePopularOptions) {
  const { viewMode } = useView();
  const platform: PlatformKey = viewMode === 'mobile' ? 'PHONE' : 'PC';
  const enabled = options?.enabled !== false;

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const plat = viewMode === 'mobile' ? 'PHONE' : 'PC';
    return homePopularCache[plat]?.wallpapers ?? [];
  });
  const [loading, setLoading] = useState(() => {
    const plat = viewMode === 'mobile' ? 'PHONE' : 'PC';
    if (options?.enabled === false) return false;
    return !homePopularCache[plat]?.ready;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    const plat = viewMode === 'mobile' ? 'PHONE' : 'PC';
    return homePopularCache[plat]?.hasMore ?? true;
  });
  const [error, setError] = useState(false);

  const pageRef = useRef(
    homePopularCache[viewMode === 'mobile' ? 'PHONE' : 'PC']?.page ?? 1,
  );
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** 有缓存则恢复；无缓存或切换 platform 时拉第一页 */
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    const cached = homePopularCache[platform];
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
    })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapResponse(raw);
        const nextHasMore = mapped.length >= PAGE_SIZE;
        setWallpapers(mapped);
        setHasMore(nextHasMore);
        homePopularCache[platform] = {
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
  }, [platform, enabled]);

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
    })
      .then((raw) => {
        const mapped = mapResponse(raw);
        if (mapped.length === 0) {
          setHasMore(false);
          setWallpapers((prev) => {
            homePopularCache[platform] = {
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
          homePopularCache[platform] = {
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
  }, [enabled, hasMore, loading, loadingMore, error, platform]);

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
