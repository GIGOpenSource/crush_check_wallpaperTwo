import { umengclick } from './aplusTracking';

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
    }
  } catch {
    umengclick('page_launch');
  }

  if (document.visibilityState === 'visible') {
    umengclick('page_show');
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      umengclick('page_show');
    } else {
      umengclick('page_hide');
    }
  });

  window.addEventListener('pageshow', (ev) => {
    if (ev.persisted) {
      umengclick('page_show');
    }
  });
}

initPageLifecycleTracking();
