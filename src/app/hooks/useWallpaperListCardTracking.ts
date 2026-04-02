import { useCallback, useEffect, useRef } from 'react';
import { umengclick } from '../analytics/aplusTracking';

/**
 * 壁纸列表卡片：仅上报点击与桌面端悬停（不做大列表曝光 wallpaper_impression）。
 */
export function useWallpaperListCardTracking(wallpaperId: string, enabled: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverReported = useRef(false);

  useEffect(() => {
    hoverReported.current = false;
  }, [wallpaperId]);

  const onClickTrack = useCallback(() => {
    if (enabled) umengclick('wallpaper_click');
  }, [enabled]);

  const onHoverTrack = useCallback(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (hoverReported.current) return;
    hoverReported.current = true;
    umengclick('wallpaper_hover');
  }, [enabled]);

  return { rootRef, onClickTrack, onHoverTrack };
}
