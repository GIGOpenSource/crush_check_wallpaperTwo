import { useState, useEffect, useCallback, useRef } from 'react';
import type { Wallpaper } from '../types';
import { getFeaturedWallpapers } from '../../api/wallpaper';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';
import { useView } from '../contexts/ViewContext';

type PlatformKey = 'PC' | 'PHONE';

type FeaturedSnapshot = {
  wallpapers: Wallpaper[];
  ready: boolean;
};

/** 跨路由保留精选轮播数据，避免从详情返回时重复请求 */
const homeFeaturedCache: Partial<Record<PlatformKey, FeaturedSnapshot>> = {};

/**
 * 首页精选轮播 Hook
 * 获取编辑精选壁纸用于轮播展示
 */
export function useHomeFeaturedWallpapers() {
  const { viewMode } = useView();
  const platform: PlatformKey = viewMode === 'mobile' ? 'PHONE' : 'PC';

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    return homeFeaturedCache[platform]?.wallpapers ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return !homeFeaturedCache[platform]?.ready;
  });
  const [error, setError] = useState(false);
  const fetchingRef = useRef(false);

  /** 有缓存则恢复；无缓存或切换 platform 时拉取数据 */
  useEffect(() => {
    const cached = homeFeaturedCache[platform];
    if (cached?.ready) {
      setWallpapers(cached.wallpapers);
      setError(false);
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(false);

    let cancelled = false;

    getFeaturedWallpapers(platform)
      .then((raw) => {
        if (cancelled) return;
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);
        setWallpapers(items);
        homeFeaturedCache[platform] = {
          wallpapers: items,
          ready: true,
        };
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
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
  }, [platform]);

  /** 刷新：清除缓存并重新加载 */
  const refresh = useCallback(() => {
    delete homeFeaturedCache[platform];
    setError(false);
    setLoading(true);
    fetchingRef.current = true;

    let cancelled = false;

    getFeaturedWallpapers(platform)
      .then((raw) => {
        if (cancelled) return;
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);
        setWallpapers(items);
        homeFeaturedCache[platform] = {
          wallpapers: items,
          ready: true,
        };
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
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
  }, [platform]);

  return {
    wallpapers,
    loading,
    error,
    refresh,
  };
}
