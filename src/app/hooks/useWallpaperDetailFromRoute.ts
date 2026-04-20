import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router';
import { getWallpaperDetail } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

export function useWallpaperDetailFromRoute() {
  const { id } = useParams();
  
  // 使用 ref 防止 StrictMode 下重复请求
  const fetchedIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false); // 记录是否正在加载

  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  /** 首帧 true，避免未跑 effect 时误判「未找到」 */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 初始加载和路由变化时加载
  useEffect(() => {
    if (!id) return;
    
    // 防止 StrictMode 下重复请求:如果已加载过相同的 id,则跳过
    // 注意：不在这里检查 isLoadingRef，因为 StrictMode 会在第一次挂载后卸载组件
    if (fetchedIdRef.current === id) {
      console.log('⏭️ 已加载过该壁纸详情，跳过重复请求');
      return;
    }
    
    let cancelled = false;
    isLoadingRef.current = true; // 标记开始加载
    setLoading(true);
    setError(false);
    setWallpaper(null);

    const loadWallpaperDetail = async () => {
      try {
        const response = await getWallpaperDetail(id);
        
        if (cancelled) return;
        
        // 响应格式: { code: 200, data: {...}, message: "success" }
        // 需要提取 data 字段
        const wallpaperData = (response as any)?.data ?? response;
        
        console.log('原始响应数据:', response);
        console.log('提取的壁纸数据:', wallpaperData);
        
        // 如果是单个对象，直接使用；如果是数组，取第一个
        const extracted = Array.isArray(wallpaperData) 
          ? wallpaperData[0] 
          : wallpaperData;
        
        console.log('映射前的数据:', extracted);
        
        const wallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
        
        console.log('映射后的壁纸对象:', {
          id: wallpaper.id,
          title: wallpaper.title,
          hasImageUrl: !!wallpaper.imageUrl,
          imageUrl: wallpaper.imageUrl?.substring(0, 100),
          resolution: wallpaper.resolution,
        });
        
        // 放宽验证条件:只要有 id 就接受数据,imageUrl 可以为空(可能是纯数据记录)
        if (wallpaper && wallpaper.id) {
          console.log('✅ 壁纸数据加载成功');
          setWallpaper(wallpaper);
          setError(false);
        } else {
          console.error('❌ 无效的壁纸数据:', {
            wallpaper,
            extracted,
            wallpaperData,
          });
          setError(true);
        }
      } catch (err) {
        console.error('❌ 加载壁纸详情失败:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) {
          console.log('设置 loading = false');
          setLoading(false);
          isLoadingRef.current = false; // 标记加载完成
          fetchedIdRef.current = id; // 记录已加载的 id
        }
      }
    };

    loadWallpaperDetail();

    return () => {
      cancelled = true;
      // 注意：不在这里重置 isLoadingRef.current，防止 StrictMode 下重复请求
      console.log('组件卸载,取消请求');
    };
  }, [id]); // 只依赖 id

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
      
      const newWallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
      
      if (newWallpaper && newWallpaper.id) {
        setWallpaper(newWallpaper);
      }
    } catch (err) {
      console.error('刷新壁纸详情失败:', err);
    }
  }, [id, wallpaper]);

  return { wallpaper, loading, error, refresh };
}
