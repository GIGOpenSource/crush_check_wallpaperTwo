import { useEffect, useState, useCallback, useRef } from 'react';
import { getUserProfile } from '../../api/wallpaper';
import type { UserProfile } from '../../api/wallpaper';

/** 管理用户个人信息的 Hook */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async (silent = false) => {
    // 取消上一次未完成的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getUserProfile();
      
      // 检查请求是否被取消
      if (controller.signal.aborted) return;

      // 兼容不同的响应结构
      const userData = (res as any)?.data || res;
      
      if (userData) {
        // 映射后端字段到前端类型
        const profileData: UserProfile = {
          ...userData,
          // 将后端的 upload_count 映射到 uploadedCount
          uploadedCount: userData.upload_count ?? userData.uploadedCount,
          upload_count: userData.upload_count,
          // 将后端的 collection_count 映射到 favoritesCount
          favoritesCount: userData.collection_count ?? userData.favoritesCount,
          collection_count: userData.collection_count,
        };
        setProfile(profileData);
      } else {
        setError('获取用户信息失败');
      }
    } catch (err: any) {
      // 如果是取消请求，不处理错误
      if (err.name === 'AbortError') return;
      
      console.error('获取用户信息失败:', err);
      setError(err.message || '获取用户信息失败');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // 首次加载时自动获取
  useEffect(() => {
    fetchProfile(false);

    // 组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfile]);

  // 暴露刷新方法
  const refresh = useCallback(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh,
  };
}
