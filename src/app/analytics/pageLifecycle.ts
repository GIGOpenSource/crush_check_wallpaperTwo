import { umengclick, reportPageEvent } from './aplusTracking';

const SESSION_LAUNCH_KEY = 'aplus_session_page_launch';

/**
 * 页面级事件（Web）：
 * - page_launch：同一会话内首次进入站点
 * - page_show：标签页回到前台 / 初始可见
 * - page_hide：标签页进入后台
 *
 * page_stay 由路由 layout 的 usePageStay + trackPageStaySeconds 上报。
 */
function initPageLifecycleTracking(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    if (!sessionStorage.getItem(SESSION_LAUNCH_KEY)) {
      sessionStorage.setItem(SESSION_LAUNCH_KEY, '1');
      umengclick('page_launch');
      // 同时上报到 /api/track/report/ 接口
      reportPageEvent('page_launch', { event_name: '网站启动' });
    }
  } catch {
    umengclick('page_launch');
    reportPageEvent('page_launch', { event_name: '网站启动' });
  }

  if (document.visibilityState === 'visible') {
    umengclick('page_show');
    // 同时上报到 /api/track/report/ 接口
    reportPageEvent('page_show', { event_name: '网站切换至前台' });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      umengclick('page_show');
      reportPageEvent('page_show', { event_name: '网站切换至前台' });
    } else {
      umengclick('page_hide');
      reportPageEvent('page_hide', { event_name: '网站切换至后台' });
    }
  });

  window.addEventListener('pageshow', (ev) => {
    if (ev.persisted) {
      umengclick('page_show');
      reportPageEvent('page_show', { event_name: '网站切换至前台' });
    }
  });
}

initPageLifecycleTracking();
