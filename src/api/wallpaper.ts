import { http } from './request';

export type WallpaperItem = {
  id: number | string;
  title?: string;
  imageUrl?: string;
  [key: string]: unknown;
};

export type WallpaperListResponse = {
  list: WallpaperItem[];
  total?: number;
  [key: string]: unknown;
};

/**
 * GET /api/wallpapers/wallpaper — 壁纸列表
 *
 * 与页面字段对应示例：
 * - currentPage ← pages.value
 * - pageSize ← 如 20
 * - name ← name.value（标题/名称模糊搜索）
 * - tag_id ← tag_id.value（标签 id）
 * - media_live ← media_live.value（Static → false，Live → true）
 * - platform ← current.value === 0 ? 'PC' : 'PHONE'
 */
export type WallpapersListParams = {
  currentPage: number;
  pageSize: number;
  /** 模糊搜索 */
  name?: string;
  /** 标签 id */
  tag_id?: number | string;
  /** Static → false，Live → true */
  media_live?: boolean;
  platform: 'PC' | 'PHONE';
};

export function getWallpapersList(params: WallpapersListParams) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper', { params });
}

/**
 * 详情：与列表同一套筛选条件，固定 pageSize=1，currentPage = 列表中的序号（第 3 条传 3）。
 */
export function getWallpaperByListPosition(
  listItemPosition: number,
  base: Pick<WallpapersListParams, 'platform'> &
    Partial<Pick<WallpapersListParams, 'name' | 'tag_id' | 'media_live'>>,
) {
  return getWallpapersList({
    currentPage: listItemPosition,
    pageSize: 1,
    platform: base.platform,
    media_live: base.media_live ?? false,
    name: base.name,
    tag_id: base.tag_id,
  });
}

export function getWallpaperList(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return http.get<WallpaperListResponse>('/api/wallpapers', { params });
}

export function getWallpaperDetail(id: number | string) {
  return http.get<WallpaperItem>(`/api/wallpapers/${id}`);
}

/** 相关推荐，wallpaper_id 为路由上的 id */
export function guessLike(wallpaper_id: string | number) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/guess_you_like/', {
    params: { wallpaper_id },
  });
}

/** 导航标签列表 */
export type NavigationTagListParams = {
  currentPage: number;
  pageSize: number;
  isHot: boolean;
};

export function getNavigationTags(params: NavigationTagListParams) {
  return http.get<WallpaperListResponse>('/api/wallpapers/navigation_tag/', { params });
}
