import type { WallpapersListParams } from '../../api/wallpaper';
import { PUBLIC_SITE_ORIGIN } from '../config/publicSite';

/** 与列表接口一致的公共参数（不含 currentPage / pageSize） */
export type WallpaperListNavBase = Pick<WallpapersListParams, 'platform'> &
  Partial<Pick<WallpapersListParams, 'name' | 'tag_id' | 'media_live'>>;

/** 路由 state：详情页用列表接口拉单条时携带 */
export type WallpaperListNavState = WallpaperListNavBase & {
  /** 列表第几条（从 1 开始），对应接口 currentPage */
  listItemPosition: number;
};

export const WALLPAPER_LIST_NAV_KEY = 'wallpaperListNav' as const;

export function parseWallpaperListNav(state: unknown): WallpaperListNavState | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const raw = (state as Record<string, unknown>)[WALLPAPER_LIST_NAV_KEY];
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const pos = o.listItemPosition;
  const platform = o.platform;
  if (typeof pos !== 'number' || pos < 1 || (platform !== 'PC' && platform !== 'PHONE')) {
    return undefined;
  }
  return {
    listItemPosition: pos,
    platform,
    media_live: typeof o.media_live === 'boolean' ? o.media_live : undefined,
    name: typeof o.name === 'string' ? o.name : undefined,
    tag_id: o.tag_id as string | number | undefined,
  };
}

/**
 * 与分享链接 query 一致：pos、platform、live、name、tag_id
 * 他人打开链接时可还原列表页码与筛选，与分享者一致。
 */
export function listNavStateToSearchParams(nav: WallpaperListNavState): URLSearchParams {
  const p = new URLSearchParams();
  p.set('pos', String(nav.listItemPosition));
  p.set('platform', nav.platform);
  if (nav.media_live === true) p.set('live', '1');
  if (nav.name) p.set('name', nav.name);
  if (nav.tag_id != null && String(nav.tag_id) !== '') {
    p.set('tag_id', String(nav.tag_id));
  }
  return p;
}

export function parseWallpaperListNavFromSearch(searchParams: URLSearchParams): WallpaperListNavState | undefined {
  const posRaw = searchParams.get('pos') ?? searchParams.get('listItemPosition');
  const platform = searchParams.get('platform');
  const pos = posRaw ? parseInt(posRaw, 10) : NaN;
  if (!Number.isFinite(pos) || pos < 1 || (platform !== 'PC' && platform !== 'PHONE')) {
    return undefined;
  }

  const live = searchParams.get('live') ?? searchParams.get('media_live');
  let media_live: boolean | undefined;
  if (live === '1' || live === 'true') media_live = true;
  else if (live === '0' || live === 'false') media_live = false;

  const name = searchParams.get('name')?.trim() || undefined;
  const tagRaw = searchParams.get('tag_id') ?? searchParams.get('tag');
  let tag_id: string | number | undefined;
  if (tagRaw != null && tagRaw !== '') {
    tag_id = /^\d+$/.test(tagRaw) ? Number(tagRaw) : tagRaw;
  }

  return {
    listItemPosition: pos,
    platform,
    media_live,
    name,
    tag_id,
  };
}

/** 路由 state 优先（站内跳转），否则从 URL 查询解析（分享链接） */
export function resolveWallpaperListNav(state: unknown, search: string): WallpaperListNavState | undefined {
  return parseWallpaperListNav(state) ?? parseWallpaperListNavFromSearch(new URLSearchParams(search));
}

export function buildWallpaperShareUrl(wallpaperId: string, nav?: WallpaperListNavState): string {
  const origin = PUBLIC_SITE_ORIGIN.replace(/\/$/, '');
  const path = `/#/wallpaper/${encodeURIComponent(wallpaperId)}`;
  const qs = nav ? listNavStateToSearchParams(nav).toString() : '';
  return qs ? `${origin}${path}?${qs}` : `${origin}${path}`;
}
