import { useState, useEffect, useCallback, useRef } from 'react';
import type { Wallpaper } from '../types';
import { getFeaturedWallpapers } from '../../api/wallpaper';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';
import { useView } from '../contexts/ViewContext';

/**
 * 首页精选轮播 Hook
 * 获取编辑精选壁纸用于轮播展示
 */
export function useHomeFeaturedWallpapers() {
  const { viewMode } = useView();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchingRef = useRef(false);

  const fetchData = useCallback((silent = false) => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    if (!silent) {
      setLoading(true);
      setError(false);
    }

    const platform = viewMode === 'mobile' ? 'PHONE' : 'PC';

    let cancelled = false;

    getFeaturedWallpapers(platform)
      .then((raw) => {
        if (cancelled) return;

        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);

        setWallpapers(items);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        fetchingRef.current = false;
        if (!cancelled && !silent) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    wallpapers,
    loading,
    error,
    refresh,
  };
}