import type { DataRouter, RouterState } from 'react-router';
import { pushAplusQueue } from './aplusQueue';
import { router } from '../routes';

let lastPvPath = '';

/** SPA：导航完成且 idle 后发送手动 PV（与 index.html 中 aplus-waiting: MAN 配合） */
function sendSpaPageView(path: string) {
  if (path === lastPvPath) return;
  lastPvPath = path;
  pushAplusQueue({
    action: 'aplus.sendPV',
    arguments: [{ is_auto: false, page_path: path }],
  });
}

function onRouterState(state: RouterState) {
  if (!state.initialized || state.navigation.state !== 'idle') return;
  sendSpaPageView(`${state.location.pathname}${state.location.search}`);
}

/** 订阅路由变化；在 main 入口侧效 import 本文件即可 */
export function initAplusRouterSubscription(r: DataRouter = router): void {
  r.subscribe((state) => {
    onRouterState(state);
  });
}

initAplusRouterSubscription();
