import { Outlet } from 'react-router';
import { usePageStay } from './usePageStay';

/** 根布局：挂载全局页面停留统计 */
export function AplusPageShell() {
  usePageStay();
  return <Outlet />;
}
