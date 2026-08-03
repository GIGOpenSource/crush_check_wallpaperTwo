import { useState, useCallback, useRef, useEffect, MutableRefObject } from 'react';

/**
 * 下拉刷新 Hook
 * 监听滚动容器的触摸事件，实现下拉刷新功能
 */
export function usePullToRefresh(
  containerRef: MutableRefObject<HTMLElement | null>,
  onRefresh: () => Promise<void> | void,
  options: {
    threshold?: number; // 触发刷新的下拉距离阈值
    maxDistance?: number; // 最大下拉距离
    disabled?: boolean; // 是否禁用
  } = {}
) {
  const { threshold = 70, maxDistance = 120, disabled = false } = options;

  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const containerRefInner = useRef<HTMLElement | null>(null);

  // 更新容器引用
  useEffect(() => {
    containerRefInner.current = containerRef.current;
  }, [containerRef]);

  // 触摸开始
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshing) return;

    const container = containerRefInner.current;
    if (!container) return;

    const scrollTop = container.scrollTop || document.documentElement.scrollTop || 0;
    scrollTopRef.current = scrollTop;

    // 只有在容器顶部时才开始追踪
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = e.touches[0].clientY;
      setIsPulling(true);
      setPullDistance(0);
    } else {
      setIsPulling(false);
    }
  }, [disabled, refreshing]);

  // 触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || refreshing) return;

    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    // 只有下拉时才生效
    if (deltaY > 0 && scrollTopRef.current <= 0) {
      // 使用阻尼效果
      const distance = Math.min(deltaY * 0.5, maxDistance);
      setPullDistance(distance);

      // 防止页面滚动
      if (containerRefInner.current) {
        containerRefInner.current.style.overflow = 'hidden';
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, disabled, refreshing, maxDistance]);

  // 触摸结束
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    // 恢复滚动
    if (containerRefInner.current) {
      containerRefInner.current.style.overflow = '';
    }

    if (pullDistance >= threshold) {
      // 触发刷新
      setRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // 未达到阈值，回弹
      setPullDistance(0);
    }
  }, [isPulling, disabled, pullDistance, threshold, onRefresh]);

  // 绑定/解绑事件
  useEffect(() => {
    const container = containerRefInner.current;
    if (!container || disabled) return;

    // 绑定到容器或document
    const target = container;
    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: true });
    target.addEventListener('touchend', handleTouchEnd);
    target.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      target.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  return {
    refreshing,
    pullDistance,
    isPulling,
    threshold,
  };
}
