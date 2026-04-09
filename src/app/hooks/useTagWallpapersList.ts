import { useCallback, useEffect, useRef, useState } from 'react';
import { getWallpapersList } from '../../api/wallpaper';
import { useView } from '../contexts/ViewContext';
import type { Wallpaper } from '../types';
import type { WallpaperListNavBase } from '../types/wallpaperListNav';
import {
  extractWallpaperItemsFromResponse,
  mapRecordToWallpaper,
  wallpaperListCoverUrl,
} from '../utils/wallpaperApiMap';

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
  return items.map(mapRecordToWallpaper).filter((w) => w.id && wallpaperListCoverUrl(w));
}

function pickTotal(raw: unknown): number | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const top = o.total ?? o.count;
  if (typeof top === 'number' && !Number.isNaN(top)) return top;
  const data = o.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).total;
    if (typeof inner === 'number' && !Number.isNaN(inner)) return inner;
  }
  return undefined;
}

/** 标签详情：壁纸列表 tag_id 为导航接口返回的 tag 字段（路由 :tagId 同值） */
export function useTagWallpapersList(tagId: string | undefined) {
  const { viewMode } = useView();
  const platform = viewMode === 'mobile' ? 'PHONE' : 'PC';

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tagIdRef = useRef(tagId);
  tagIdRef.current = tagId;

  useEffect(() => {
    if (!tagId?.trim()) {
      setWallpapers([]);
      setTotal(undefined);
      setLoading(false);
      setError(true);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    pageRef.current = 1;
    setWallpapers([]);
    setTotal(undefined);
    setHasMore(true);
    setLoading(true);
    setError(false);
    fetchingRef.current = true;

    getWallpapersList({
      currentPage: 1,
      pageSize: PAGE_SIZE,
      platform,
      media_live: false,
      tag_id: tagId,
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
  }, [tagId, platform]);

  const loadNextPage = useCallback(() => {
    const id = tagIdRef.current?.trim();
    if (!id || !hasMore || loading || loadingMore || error || fetchingRef.current) return;

    const nextPage = pageRef.current + 1;
    fetchingRef.current = true;
    setLoadingMore(true);

    getWallpapersList({
      currentPage: nextPage,
      pageSize: PAGE_SIZE,
      platform,
      media_live: false,
      tag_id: id,
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
  }, [hasMore, loading, loadingMore, error, platform]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || error || !hasMore || loadingMore || !tagId?.trim()) return;

    const ob = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadNextPage();
      },
      { root: null, rootMargin: '160px', threshold: 0 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [loading, error, hasMore, loadingMore, loadNextPage, wallpapers.length, tagId]);

  const listNavBase: WallpaperListNavBase | undefined = tagId?.trim()
    ? { platform, tag_id: tagId, media_live: false }
    : undefined;

  return {
    wallpapers,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    sentinelRef,
    listNavBase,
  };
}
