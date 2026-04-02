import type { WallpapersListParams } from '../../api/wallpaper';

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
