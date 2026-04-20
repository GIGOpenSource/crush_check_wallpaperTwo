import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router';
import { getWallpaperDetail } from '../../api/wallpaper';
import { mapRecordToWallpaper } from '../utils/wallpaperApiMap';
import type { Wallpaper } from '../types';

/**
 * 从路由参数获取壁纸 ID 并加载壁纸详情
 * 自动处理数据映射、加载状态和错误状态
 */
export function useWallpaperDetailFromRoute() {
  const { id } = useParams();
  
  // 使用 ref 记录上一次加载的 ID，防止重复请求
  const lastLoadedIdRef = useRef<string | null>(null);

  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  /** 首帧 true，避免未跑 effect 时误判「未找到」 */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 初始加载和路由变化时加载
  useEffect(() => {
    if (!id) {
      console.log('⚠️ 壁纸 ID 为空，跳过加载');
      setLoading(false);
      return;
    }
    
    // 如果已经加载过相同的 ID，跳过
    if (lastLoadedIdRef.current === id && wallpaper) {
      console.log('⏭️ 已加载过该壁纸详情，跳过重复请求');
      return;
    }
    
    console.log('🔄 开始加载壁纸详情, ID:', id);
    
    let cancelled = false;
    setLoading(true);
    setError(false);
    setWallpaper(null);

    const loadWallpaperDetail = async () => {
      try {
        console.log('📡 发起 API 请求获取壁纸详情:', id);
        const response = await getWallpaperDetail(id);
        
        if (cancelled) {
          console.log('⚠️ 请求已被取消');
          return;
        }
        
        console.log('📥 API 响应:', response);
        
        // 响应格式: { code: 200, data: {...}, message: "success" }
        // 需要提取 data 字段
        const wallpaperData = (response as any)?.data ?? response;
        console.log('📦 提取的壁纸数据:', wallpaperData);
        
        // 如果是单个对象，直接使用；如果是数组，取第一个
        const extracted = Array.isArray(wallpaperData) 
          ? wallpaperData[0] 
          : wallpaperData;
        
        console.log('🔍 映射前的数据:', extracted);
        
        const wallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
        console.log('✅ 映射后的壁纸对象:', wallpaper);
        
        // 放宽验证条件:只要有 id 就接受数据,imageUrl 可以为空(可能是纯数据记录)
        if (wallpaper && wallpaper.id && wallpaper.id !== '0') {
          console.log('✅ 壁纸数据有效，更新状态');
          setWallpaper(wallpaper);
          setError(false);
          lastLoadedIdRef.current = id; // 记录已加载的 ID
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
          console.log('🏁 加载完成，设置 loading = false');
          setLoading(false);
        }
      }
    };

    loadWallpaperDetail();

    return () => {
      console.log('🧹 组件卸载，取消请求');
      cancelled = true;
    };
  }, [id, wallpaper]); // 依赖 id 和 wallpaper

  /**
   * 刷新壁纸数据（用于下载、收藏等操作后更新统计数据）
   * 调用 /api/wallpapers/wallpaper 接口获取最新数据
   * 只更新统计数据，不显示 loading 状态
   */
  const refresh = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('🔄 刷新壁纸详情数据:', id);
      // 统一使用 getWallpaperDetail 接口获取最新数据
      const response = await getWallpaperDetail(id);
      
      // 响应格式: { code: 200, data: {...}, message: "success" }
      const wallpaperData = (response as any)?.data ?? response;
      
      // 如果是单个对象，直接使用；如果是数组，取第一个
      const extracted = Array.isArray(wallpaperData) 
        ? wallpaperData[0] 
        : wallpaperData;
      
      const newWallpaper = mapRecordToWallpaper(extracted as Record<string, unknown>);
      
      if (newWallpaper && newWallpaper.id && newWallpaper.id !== '0') {
        console.log('✅ 刷新成功，更新壁纸数据');
        setWallpaper(newWallpaper);
      }
    } catch (err) {
      console.error('刷新壁纸详情失败:', err);
    }
  }, [id]);

  return { wallpaper, loading, error, refresh };
}
