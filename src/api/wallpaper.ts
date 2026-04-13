import { http } from './request';

export type WallpaperItem = {
  // id: number | string;
  // title?: string;
  // imageUrl?: string;
  id: number | string;
  title: string;
  imageUrl: string;
  description?: string;
  category?: number[];
  created_at?: string;
  downloads?: number;
  views?: number;
  likes?: number;
  like_count?: number;
  is_liked?: boolean;
  is_collected?: boolean;
  has_watermark?: boolean;
  height?: number;
  width?: number;
  resolution?: string;
  image_format?: string;
  is_hd?: boolean;
  is_live?: boolean;
  hot_score?: number;
  source_url?: string;
  person_upload?: null;
  // tags?: TagItem[];
  // uploader?: UserItem;
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
  /** 分辨率筛选，多个值用逗号分隔，如 "2560x1440,1920x1080" */
  resolution?: string;
  /** 宽高比筛选，多个值用逗号分隔，如 "16:9,21:9" */
  aspect_ratio?: string;
};

export function getWallpapersList(params: WallpapersListParams) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper', { params });
}

/**
 * 获取用户收藏列表
 * GET /api/wallpapers/wallpaper/my-collections/
 */
export type MyCollectionsParams = {
  currentPage: number;
  pageSize: number;
  platform: 'PC' | 'PHONE';
};

export function getMyCollections(params: MyCollectionsParams) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/my-collections/', { params });
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
  return http.get<WallpaperItem>(`/api/wallpapers/wallpaper/${id}`);
}

/** 相关推荐，wallpaper_id 为路由上的 id */
export function guessLike(wallpaper_id: string | number) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/guess_you_like/', {
    params: { wallpaper_id },
  });
}

/**
 * 获取精选壁纸（轮播图）
 * GET /api/wallpapers/wallpaper/featured/
 */
export function getFeaturedWallpapers() {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/featured/');
}

/** 下载埋点：点击下载时上报 */
export function recordWallpaperDownload(wallpaper_id: string | number) {
  return http.post('/api/wallpapers/wallpaper/record-download/', { wallpaper_id });
}


/** 下载埋点：点击收藏 */
export function recordWallpaperCollect(wallpaper_id: string | number) {
  return http.post('/api/wallpapers/wallpaper/toggle-collect/', { wallpaper_id });
}


/** 导航标签列表 */
export type NavigationTagListParams = {
  currentPage: number;
  pageSize: number;
  isHot: boolean;
};

export function getNavigationTagList(params: NavigationTagListParams) {
  return http.get('/api/wallpapers/navigation-tag/list', { params });
}

/** 导航标签列表（旧版接口，兼容 useNavigationTags Hook） */
export function getNavigationTags(params: NavigationTagListParams) {
  return http.get('/api/wallpapers/navigation_tag/', { params });
}

/** 用户个人信息类型 */
export type UserProfile = {
  id: string | number;
  username: string;
  avatar?: string;
  level?: number;
  points?: number;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  uploadedCount?: number;
  /** 上传数量（后端字段：upload_count） */
  upload_count?: number;
  favoritesCount?: number;
  /** 收藏数量（后端字段：collection_count） */
  collection_count?: number;
  [key: string]: unknown;
};

/** 获取当前用户个人信息 */
export function getUserProfile() {
  return http.get<UserProfile>('/api/client/users/profile/');
}

/** 壁纸标签项 */
export type TagItem = {
  id: number | string;
  name: string;
  wallpaper_count?: number;
  [key: string]: unknown;
};

/** 标签列表响应 */
export type TagListResponse = {
  code: number;
  message: string;
  data: TagItem[];
};

/**
 * 获取热门标签列表
 * GET /api/wallpapers/tags/hot/
 * 无需参数
 */
export function getHotTags() {
  return http.get<TagListResponse>('/api/wallpapers/tags/hot/');
}

/**
 * 获取所有标签列表
 * GET /api/wallpapers/tags/list/
 * 无需参数
 */
export function getAllTags() {
  return http.get<TagListResponse>('/api/wallpapers/tags/list/');
}

// 保留旧接口名称以兼容现有代码
/** @deprecated 使用 getHotTags 或 getAllTags */
export function getTagList() {
  return getHotTags();
}

/**
 * 上传壁纸参数
 * POST /api/wallpapers/wallpaper/upload-person/
 */
export type UploadWallpaperParams = {
  /** 平台类型 */
  platform: 'PC' | 'PHONE';
  /** 壁纸文件 */
  file: File;
  /** 壁纸标题 */
  title: string;
  /** 描述（可选） */
  description?: string;
  /** 已有标签 id，如 1,2 或 [1,2] */
  tag_ids?: string;
  /** 新标签名称，多个用逗号或 JSON 数组 */
  tag_names?: string;
};

/**
 * 上传壁纸
 * POST /api/wallpapers/wallpaper/upload-person/
 */
export function uploadWallpaper(data: UploadWallpaperParams) {
  const formData = new FormData();
  formData.append('platform', data.platform);
  formData.append('file', data.file);
  formData.append('title', data.title);
  
  if (data.description) {
    formData.append('description', data.description);
  }
  
  if (data.tag_ids) {
    formData.append('tag_ids', data.tag_ids);
  }
  
  if (data.tag_names) {
    formData.append('tag_names', data.tag_names);
  }
  
  // 注意：不要手动设置 Content-Type，让浏览器自动设置包含 boundary 的值
  return http.post('/api/wallpapers/wallpaper/upload-person/', formData);
}