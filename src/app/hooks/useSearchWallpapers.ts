import type { WallpaperListResponse, WallpapersListParams } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import { useState, useEffect, useMemo } from 'react';
import { getWallpapersList } from '../../api/wallpaper';
import type { WallpapersListParams } from '../../api/wallpaper';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

export type SearchFilters = {
  resolution: string[];
  aspectRatio: string[];
};

export function useSearchWallpapers(
  query: string,
  filters: SearchFilters,
  initialPage: number = 1,
  pageSize: number = 20,
  platform: 'PC' | 'PHONE' = 'PHONE',
) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 构建 API 参数
  const apiParams = useMemo(() => {
    const params: WallpapersListParams = {
      currentPage,
      pageSize,
      platform,
    };

    // 搜索关键词
    if (query.trim()) {
      params.name = query.trim();
    }

    // 分辨率筛选（多个值用逗号分隔）
    if (filters.resolution.length > 0) {
      params.resolution = filters.resolution.join(',');
    }

    // 宽高比筛选（多个值用逗号分隔）
    if (filters.aspectRatio.length > 0) {
      params.aspect_ratio = filters.aspectRatio.join(',');
    }

    return params;
  }, [query, filters, currentPage, pageSize, platform]);

  // 获取壁纸数据
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getWallpapersList(apiParams)
      .then((raw) => {
        if (cancelled) return;

        // 提取数据数组
        const data = extractWallpaperItemsFromResponse(raw);
        const items = data.map(mapRecordToWallpaper);

        // 如果是第一页，替换数据；否则追加
        if (currentPage === 1) {
          setWallpapers(items);
        } else {
          setWallpapers((prev) => [...prev, ...items]);
        }

        // 检查是否还有更多数据
        const totalItems = (raw as any)?.total || (raw as any)?.count || items.length;
        setTotalCount(totalItems);
        setHasMore(items.length === pageSize);
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
  }, [apiParams, currentPage, pageSize]);

  // 加载更多
  const loadMore = () => {
    if (!hasMore || loading) return;
    setCurrentPage(prev => prev + 1);
  };

  // 刷新（重新加载第一页）
  const refresh = () => {
    setWallpapers([]);
    setCurrentPage(1);
  };

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
