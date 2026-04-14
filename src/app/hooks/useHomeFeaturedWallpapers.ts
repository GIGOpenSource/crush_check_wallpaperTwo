import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    // 根据 viewMode 转换 platform 参数
    const platform = viewMode === 'mobile' ? 'PHONE' : 'PC';

    getFeaturedWallpapers(platform)
      .then((raw) => {
        if (cancelled) return;

        // 提取数据数组
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
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  return {
    wallpapers,
    loading,
    error,
  };
}