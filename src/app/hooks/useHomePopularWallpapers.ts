import { useCallback, useEffect, useRef, useState } from 'react';
import { getWallpapersList } from '../../api/wallpaper';
import { useView } from '../contexts/ViewContext';
import type { Wallpaper } from '../types';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

const PAGE_SIZE = 20;

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
  return items.map(mapRecordToWallpaper).filter((w) => w.id && w.imageUrl);
}

export function useHomePopularWallpapers() {
  const { viewMode } = useView();
  const platform = viewMode === 'mobile' ? 'PHONE' : 'PC';

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** 首屏 / 切换 PC·手机时重置并拉第一页 */
  useEffect(() => {
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
        setWallpapers(mapped);
        setHasMore(mapped.length >= PAGE_SIZE);
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
  }, [platform]);

  const loadNextPage = useCallback(() => {
    if (!hasMore || loading || loadingMore || error || fetchingRef.current) return;

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
          return;
        }
        pageRef.current = nextPage;
        setWallpapers((prev) => mergeDedupe(prev, mapped));
        setHasMore(mapped.length >= PAGE_SIZE);
      })
      .catch(() => {
        setHasMore(false);
      })
      .finally(() => {
        fetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, loading, loadingMore, error, platform]);

  useEffect(() => {
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
  }, [loading, error, hasMore, loadingMore, loadNextPage, wallpapers.length]);

  return {
    wallpapers,
    loading,
    loadingMore,
    error,
    hasMore,
    sentinelRef,
  };
}
