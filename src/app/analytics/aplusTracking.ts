import { pushAplusQueue } from './aplusQueue';

const ANON_USER_KEY = 'aplus_anon_device_id';

export function formatDateTime(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/** Web：当前路径（对齐 uni 的 page 路径语义） */
export function getCurrentPagePurePath(): string {
  if (typeof window === 'undefined') return '/';
  const { pathname, search } = window.location;
  return `${pathname}${search}` || '/';
}

function getOrCreateAnonUserId(): string {
  try {
    let id = localStorage.getItem(ANON_USER_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANON_USER_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

function getCoarseDeviceType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
  return 'pc';
}

export type AplusRecordParams = {
  userId: string;
  appVersion: string;
  eventTime: string;
  pageName: string;
  deviceType: string;
  region: string;
};

/** 与 uni 版 getparams 对齐的公共字段（Web 环境） */
export function getTrackingParams(): AplusRecordParams {
  return {
    userId: getOrCreateAnonUserId(),
    appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.1',
    eventTime: formatDateTime(),
    pageName: getCurrentPagePurePath(),
    deviceType: getCoarseDeviceType(),
    region: typeof navigator !== 'undefined' ? navigator.language || '' : '',
  };
}

/** 点击等自定义事件：aplus.record(name, 'CLK', params) */
export function umengClick(name: string): void {
  const params = getTrackingParams();
  pushAplusQueue({
    action: 'aplus.record',
    arguments: [name, 'CLK', params],
  });
}

/** 与 uni 侧小写命名一致的可选别名 */
export const umengclick = umengClick;

/** 停留/曝光类（与 uni 侧 umengstay 一致，事件类型同为 CLK） */
export function umengStay(name: string): void {
  const params = getTrackingParams();
  pushAplusQueue({
    action: 'aplus.record',
    arguments: [name, 'CLK', params],
  });
}

/** 页面停留时长（秒），供 usePageStay 使用 */
export function trackPageStaySeconds(stayDuration: number): void {
  try {
    const params: AplusRecordParams & { stayDuration: number } = {
      ...getTrackingParams(),
      stayDuration,
    };
    pushAplusQueue({
      action: 'aplus.record',
      arguments: ['page_stay', 'CLK', params],
    });
  } catch (e) {
    console.error('页面停留时长统计发送失败:', e);
  }
}
