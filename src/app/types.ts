// Type definitions for the wallpaper sharing platform

/** 壁纸详情标签：展示用 name，跳转/列表请求 tag_id 用 id */
export interface WallpaperTag {
  id: string;
  name: string;
}

export interface Wallpaper {
  id: string;
  title: string;
  /** 原图（接口 `url`），用于详情大图与下载 */
  imageUrl: string;
  /** 列表缩略图（接口 `thumb_url`）；无则列表回退 `imageUrl` */
  thumbUrl?: string;
  resolution: string;
  fileSize: string;
  uploadDate: string;
  uploader: User;
  tags: WallpaperTag[];
  views: number;
  downloads: number;
  likes: number;
  favorites: number;
  aspectRatio: string;
  colors: string[];
  purity: 'SFW' | 'Sketchy' | 'NSFW';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  points: number;
  badges: Badge[];
  uploadedCount: number;
  favoritesCount: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Tag {
  /** 接口 tag：壁纸列表 tag_id、路由 /tag/:tagId 使用此值，勿用 id 代替 */
  tag: string;
  /** 可选记录 id，仅展示/调试；请求与跳转一律用 tag */
  id?: string;
  /** 搜索/兼容字段，勿直接当主标题（主标题用 navName） */
  name: string;
  /** 接口 nav_name，标签页与详情标题展示 */
  navName?: string;
  description?: string;
  wallpaperCount: number;
}

export interface SearchFilters {
  resolution?: string;
  aspectRatio?: string;
  colors?: string[];
  purity?: ('SFW' | 'Sketchy' | 'NSFW')[];
  sortBy?: 'relevance' | 'date' | 'views' | 'downloads';
}
