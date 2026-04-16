import { useEffect, useState, useCallback, useRef } from 'react';
import { getUserProfile, getOtherUserProfile } from '../../api/wallpaper';
import type { UserProfile } from '../../api/wallpaper';

/** 管理用户个人信息的 Hook */
export function useUserProfile(otherId?: string | number) {
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
      // 根据是否有 otherId 决定调用哪个接口
      const res = otherId 
        ? await getOtherUserProfile(otherId)
        : await getUserProfile();
      
      // 检查请求是否被取消
      if (controller.signal.aborted) return;

      // 兼容不同的响应结构
      const userData = (res as any)?.data || res;
      
      if (userData) {
        // 调试：打印后端返回的所有字段
        console.log('=== 用户信息调试 ===');
        console.log('后端返回的完整数据:', userData);
        console.log('follower_count:', userData.follower_count);
        console.log('followers_count:', userData.followers_count);
        console.log('following_count:', userData.following_count);
        console.log('====================');
        
        // 映射后端字段到前端类型
        const profileData: UserProfile = {
          ...userData,
          // 将后端的 upload_count 映射到 uploadedCount
          uploadedCount: userData.upload_count ?? userData.uploadedCount,
          upload_count: userData.upload_count,
          // 将后端的 collection_count 映射到 favoritesCount
          favoritesCount: userData.collection_count ?? userData.favoritesCount,
          collection_count: userData.collection_count,
          // 兼容 followers_count 和 follower_count
          follower_count: userData.follower_count ?? userData.followers_count,
          // 如果是其他用户，添加 is_followed 字段
          is_followed: userData.is_followed ?? false,
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
  }, [otherId]);

  // 当 otherId 变化时重新获取
  useEffect(() => {
    fetchProfile(false);

    // 组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // 依赖 otherId 而不是 fetchProfile，避免无限循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId]);

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