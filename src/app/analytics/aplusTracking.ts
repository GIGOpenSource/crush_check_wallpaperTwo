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

/** 获取页面类型映射 */
function getPageType(pathname?: string): string {
  if (typeof window === 'undefined') return 'homepage';
  const path = pathname || window.location.pathname;
  
  if (path === '/' || path === '') return 'homepage';
  if (path.includes('/site-info')) return 'site_info';
  if (path.includes('/profile/edit')) return 'profile_edit';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/markwallpapers/tag')) return 'tag_detail';
  if (path.includes('/tags') && !path.includes('/tags/')) return 'tag';
  if (path.includes('/tags/')) return 'tag_detail';
  if (path.includes('/search')) return 'search';
  if (path.includes('/detail') || path.includes('/wallpaper/')) return 'retrieve';
  if (path.includes('/trending') || path.includes('/hot')) return 'trending';
  if (path.includes('/notifications')) return 'notifications';
  if (path.includes('/settings')) return 'settings';
  if (path.includes('/upload')) return 'upload';
  if (path.includes('/login')) return 'login';
  if (path.includes('/register')) return 'register';
  
  return 'homepage';
}

/** 获取页面名称映射 */
function getPageName(pathname?: string): string {
  if (typeof window === 'undefined') return '首页';
  const path = pathname || window.location.pathname;
  
  if (path === '/' || path === '') return '首页';
  if (path.includes('/site-info')) return '站点信息';
  if (path.includes('/profile/edit')) return '编辑资料';
  if (path.includes('/profile')) return '个人主页';
  if (path.includes('/markwallpapers/tag')) return '标签详情';
  if (path.includes('/tags') && !path.includes('/tags/')) return '标签';
  if (path.includes('/tags/')) return '标签详情';
  if (path.includes('/search')) return '搜索';
  if (path.includes('/detail') || path.includes('/wallpaper/')) return '壁纸详情';
  if (path.includes('/trending') || path.includes('/hot')) return '热门';
  if (path.includes('/notifications')) return '消息';
  if (path.includes('/settings')) return '设置';
  if (path.includes('/upload')) return '上传';
  if (path.includes('/login')) return '登录';
  if (path.includes('/register')) return '注册';
  
  return '首页';
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

/** 页面浏览上报接口参数类型 */
export type PageViewReportParams = {
  unique_id: string;
  app_version: string;
  event_time: string;
  page_name: string;
  page_type: string;
  device_type: string;
  region: string;
  referer: string;
  page_path: string;
  event_type: string;
  event_name?: string;
  page_stay?: number;
};

/** 调用 /api/track/report/ 接口上报页面事件 */
export async function reportPageEvent(
  eventType: string,
  extraParams?: {
    event_name?: string;
    page_stay?: number;
    leavingPage?: {
      pathname: string;
      search: string;
    };
  }
): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // 如果有离开页面信息，使用离开页面的信息；否则使用当前页面信息
    const pathname = extraParams?.leavingPage?.pathname;
    const search = extraParams?.leavingPage?.search;
    const pagePath = extraParams?.leavingPage 
      ? `${extraParams.leavingPage.pathname}${extraParams.leavingPage.search}` || '/'
      : getCurrentPagePurePath();
    
    console.log('📊 [reportPageEvent]', {
      eventType,
      leavingPage: extraParams?.leavingPage,
      currentPage: getCurrentPagePurePath(),
      finalPagePath: pagePath,
      pageName: getPageName(pathname),
      pageType: getPageType(pathname),
    });
    
    const params: PageViewReportParams = {
      unique_id: getOrCreateAnonUserId(),
      app_version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
      event_time: formatDateTime(),
      page_name: getPageName(pathname),
      page_type: getPageType(pathname),
      device_type: getCoarseDeviceType(),
      region: typeof navigator !== 'undefined' ? navigator.language || '' : '',
      referer: 'https://www.markwallpapers.com/',
      page_path: pagePath,
      event_type: eventType,
      event_name: extraParams?.event_name,
      page_stay: extraParams?.page_stay,
    };

    const response = await fetch('/api/track/report/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.warn('页面事件上报接口调用失败:', response.status);
    }
  } catch (error) {
    console.error('页面事件上报接口调用异常:', error);
  }
}

/** 页面浏览上报（保留原接口用于兼容） */
export async function reportPageView(): Promise<void> {
  await reportPageEvent('page_view');
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
