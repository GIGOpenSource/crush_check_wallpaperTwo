import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { trackPageStaySeconds } from './aplusTracking';

export type UsePageStayOptions = {
  onShowCallback?: () => void;
  onHideCallback?: () => void;
};

/**
 * 页面停留 page_stay：**仅在离开当前路由时**（pathname/search 变化或卸载）在 effect cleanup 里上报，
 * 携带上一页的停留秒数；进入新页时只记录开始时间，**不会**在此时打 page_stay。
 */
export function usePageStay(options: UsePageStayOptions = {}): { clear: () => void } {
  const location = useLocation();
  const startRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clear = () => {
    startRef.current = null;
  };

  useEffect(() => {
    startRef.current = Date.now();
    optionsRef.current.onShowCallback?.();

    return () => {
      const start = startRef.current;
      if (start != null) {
        const elapsedMs = Date.now() - start;
        const stayDuration = Math.floor(elapsedMs / 1000);
        // 只在离开页面上报；未满 1 秒视为无效（含 React StrictMode 进页立刻卸载的 0 秒）
        if (stayDuration >= 1) {
          trackPageStaySeconds(stayDuration);
        }
      }
      startRef.current = null;
      optionsRef.current.onHideCallback?.();
    };
  }, [location.pathname, location.search]);

  return { clear };
}
