import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { getWallpaperDetail } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

export function useWallpaperDetailFromRoute() {
  const { id } = useParams();

  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  /** 首帧 true，避免未跑 effect 时误判「未找到」 */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /** 加载壁纸详情的核心逻辑 */
  const loadWallpaperDetail = useCallback(async (signal: AbortSignal) => {
    if (!id) return;

    // 统一使用 getWallpaperDetail 接口加载壁纸详情
    setLoading(true);
    setError(false);
    setWallpaper(null);

    try {
      const response = await getWallpaperDetail(id);
      
      if (signal.aborted) return;
      
      // 响应格式: { code: 200, data: {...}, message: "success" }
      // 需要提取 data 字段
      const wallpaperData = (response as any)?.data ?? response;
      
      // 如果是单个对象，直接使用；如果是数组，取第一个
      const extracted = Array.isArray(wallpaperData) 
        ? wallpaperData[0] 
        : wallpaperData;
      
      const wallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
      
      if (wallpaper && wallpaper.id && wallpaper.imageUrl) {
        setWallpaper(wallpaper);
        setError(false);
      } else {
        console.error('Invalid wallpaper data:', wallpaper);
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load wallpaper detail:', err);
      if (!signal.aborted) setError(true);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [id]);

  // 初始加载和路由变化时加载
  useEffect(() => {
    if (!id) return;
    
    const controller = new AbortController();
    loadWallpaperDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, loadWallpaperDetail]);

  /**
   * 刷新壁纸数据（用于下载、收藏等操作后更新统计数据）
   * 调用 /api/wallpapers/wallpaper 接口获取最新数据
   * 只更新统计数据，不显示 loading 状态
   */
  const refresh = useCallback(async () => {
    if (!id || !wallpaper) return;
    
    try {
      // 统一使用 getWallpaperDetail 接口获取最新数据
      const response = await getWallpaperDetail(id);
      
      // 响应格式: { code: 200, data: {...}, message: "success" }
      const wallpaperData = (response as any)?.data ?? response;
      
      // 如果是单个对象，直接使用；如果是数组，取第一个
      const extracted = Array.isArray(wallpaperData) 
        ? wallpaperData[0] 
        : wallpaperData;
      
      const updatedWallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
      
      if (updatedWallpaper.id && updatedWallpaper.imageUrl) {
        // 只更新统计数据相关的字段，保持其他状态不变
        setWallpaper(prev => prev ? {
          ...prev,
          views: updatedWallpaper.views,
          downloads: updatedWallpaper.downloads,
          likes: updatedWallpaper.likes,
          favorites: updatedWallpaper.favorites,
        } : prev);
        console.log('壁纸统计数据已更新');
      }
    } catch (err) {
      console.error('刷新壁纸统计数据失败:', err);
      // 静默失败，不影响用户体验
    }
  }, [id, wallpaper]);

  /**
   * 本地更新壁纸统计数据（立即生效，不等待接口）
   */
  const updateWallpaperStats = useCallback((updates: Partial<Pick<Wallpaper, 'views' | 'downloads' | 'likes' | 'favorites'>>) => {
    setWallpaper(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return { wallpaper, loading, error, refresh, updateWallpaperStats };
}