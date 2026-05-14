import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { trackPageStaySeconds, reportPageEvent } from './aplusTracking';

export type UsePageStayOptions = {
  onShowCallback?: () => void;
  onHideCallback?: () => void;
};

/**
 * 页面停留 page_stay：**仅在离开当前路由时**（pathname/search 变化或卸载）在 effect cleanup 里上报，
 * 携带**离开页面**的停留秒数和页面信息；进入新页时只记录开始时间，**不会**在此时打 page_stay。
 */
export function usePageStay(options: UsePageStayOptions = {}): { clear: () => void } {
  const location = useLocation();
  const startRef = useRef<number | null>(null);
  const leavingPageRef = useRef<{
    pathname: string;
    search: string;
  } | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clear = () => {
    startRef.current = null;
    leavingPageRef.current = null;
  };

  useEffect(() => {
    // 关键修复：在 effect 执行时立即保存当前页面信息到局部变量
    // 这样在 cleanup 函数中可以访问到正确的离开页面信息
    const enteringPathname = location.pathname;
    const enteringSearch = location.search;
    
    // 记录进入新页面时的开始时间和页面信息
    startRef.current = Date.now();
    leavingPageRef.current = {
      pathname: enteringPathname,
      search: enteringSearch,
    };
    optionsRef.current.onShowCallback?.();

    return () => {
      // 关键：使用保存的 leavingPageRef，而不是重新读取 location
      const start = startRef.current;
      const leavingPage = leavingPageRef.current;
      
      // 调试日志：确认离开时的页面信息
      console.log('👋 [usePageStay cleanup]', {
        savedLeavingPage: leavingPage,
        currentLocation: { pathname: location.pathname, search: location.search },
      });
      
      if (start != null && leavingPage != null) {
        const elapsedMs = Date.now() - start;
        const stayDuration = Math.floor(elapsedMs / 1000);
        // 只在离开页面上报；未满 1 秒视为无效（含 React StrictMode 进页立刻卸载的 0 秒）
        if (stayDuration >= 1) {
          // 友盟埋点
          trackPageStaySeconds(stayDuration);
          // 同时上报到 /api/track/report/ 接口，使用离开页面的信息
          // 关键：确保使用 leavingPage 的 pathname，而不是当前 location 的 pathname
          console.log('📤 [usePageStay] 上报离开页面数据', {
            leavingPage: leavingPage,
            stayDuration: stayDuration,
          });
          reportPageEvent('page_stay', {
            event_name: '页面停留时长',
            page_stay: stayDuration,
            leavingPage: {
              pathname: leavingPage.pathname,
              search: leavingPage.search,
            },
          });
        }
      }
      startRef.current = null;
      leavingPageRef.current = null;
      optionsRef.current.onHideCallback?.();
    };
  }, [location.pathname, location.search]);

  return { clear };
}