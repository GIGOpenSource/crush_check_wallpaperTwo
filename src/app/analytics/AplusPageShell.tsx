import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { usePageStay } from './usePageStay';
import { reportPageView } from './aplusTracking';

/** 根布局：挂载全局页面停留统计和页面浏览上报 */
export function AplusPageShell() {
  const location = useLocation();

  useEffect(() => {
    // 页面加载或路由变化时，调用 /api/track/report/ 接口上报页面浏览
    reportPageView();
  }, [location.pathname, location.search]);

  usePageStay();
  return <Outlet />;
}
