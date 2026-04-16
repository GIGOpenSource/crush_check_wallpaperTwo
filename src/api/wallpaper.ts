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
  collect_count?: number;
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
  /** 壁纸标签 */
  tags?: Array<{
    id: number | string;
    name: string;
  }>;
  /** 上传者信息 */
  uploader?: {
    id: number | string;
    username: string;
    nickname?: string;
    avatar?: string;
    avatar_url?: string;
    /** 用户唯一标识 */
    customer_id?: number | string;
    level?: number;
    points?: number;
    upload_count?: number;
    follower_count?: number;
  };
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
  /** 排序方式：latest=最新, views=最多浏览, downloads=最多下载, hot=热门 */
  order?: 'latest' | 'views' | 'downloads' | 'hot';
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
 * 获取用户上传列表
 * GET /api/wallpapers/wallpaper/my-uploads/
 */
export type MyUploadsParams = {
  currentPage: number;
  pageSize: number;
  platform: 'PC' | 'PHONE';
};

export function getMyUploads(params: MyUploadsParams) {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/my-uploads/', { params });
}

/**
 * 删除壁纸
 * DELETE /api/wallpapers/wallpaper/{id}/
 * @param wallpaperId - 壁纸ID
 */
export function deleteWallpaper(wallpaperId: number | string) {
  return http.delete<void>(`/api/wallpapers/wallpaper/${wallpaperId}/`);
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
 * 获取精选壁纸(轮播图)
 * GET /api/wallpapers/wallpaper/featured/
 */
export function getFeaturedWallpapers(platform: 'PC' | 'PHONE') {
  return http.get<WallpaperListResponse>('/api/wallpapers/wallpaper/featured/', {
    params: { platform },
  });
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
  /** 头像URL（用于编辑） */
  avatar_url?: string;
  /** 昵称 */
  nickname?: string;
  /** 性别: 0-未知, 1-男, 2-女 */
  gender?: 0 | 1 | 2;
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
  /** 关注数量 */
  following_count?: number;
  /** 粉丝数量 */
  follower_count?: number;
  [key: string]: unknown;
};

/** 获取当前用户个人信息 */
export function getUserProfile() {
  return http.get<UserProfile>('/api/client/users/profile/');
}

/**
 * 获取其他用户个人信息
 * GET /api/client/users/profile/
 * 参数: other_id - 其他用户的ID
 */
export function getOtherUserProfile(otherId: number | string) {
  return http.get<UserProfile>('/api/client/users/profile/', { params: { other_id: otherId } });
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

/**
 * 更新用户个人信息参数
 * POST /api/client/users/update-profile/
 */
export type UpdateUserProfileParams = {
  /** 昵称 */
  nickname?: string;
  /** 性别: 0-未知, 1-男, 2-女 */
  gender?: 0 | 1 | 2;
  /** 头像URL */
  avatar_url?: string;
};

/**
 * 更新用户个人信息
 * POST /api/client/users/update-profile/
 */
export function updateUserProfile(data: UpdateUserProfileParams) {
  return http.post('/api/client/users/update-profile/', data);
}

/**
 * 上传头像参数
 * POST /api/client/upload-image/
 */
export type UploadAvatarParams = {
  /** 文件名 */
  file_name: string;
  /** 类型：固定为 'img' */
  type: 'img';
  /** 文件对象 */
  file: File;
};

/**
 * 上传头像
 * POST /api/client/upload-image/
 */
export function uploadAvatar(data: UploadAvatarParams) {
  const formData = new FormData();
  formData.append('file_name', data.file_name);
  formData.append('type', data.type);
  formData.append('file', data.file);
  
  // 注意：不要手动设置 Content-Type，让浏览器自动设置包含 boundary 的值
  return http.post('/api/client/upload-image/', formData);
}

/**
 * 评论用户信息
 */
export type CommentCustomerInfo = {
  /** 用户ID */
  id: number;
  /** 用户邮箱 */
  email: string;
  /** 用户昵称 */
  nickname: string;
  /** 用户头像URL */
  avatar_url: string;
};

/**
 * 评论项
 */
export type CommentItem = {
  /** 评论ID */
  id: number;
  /** 评论内容 */
  content: string;
  /** 壁纸ID */
  wallpaper_id: number | string;
  /** 用户ID */
  user_id: number;
  /** 发布人信息 */
  customer_info?: CommentCustomerInfo;
  /** 点赞数 */
  like_count?: number;
  /** 是否已点赞 */
  is_liked?: boolean;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
  /** 回复的评论ID（如果是回复） */
  parent_id?: number | null;
  /** 父评论 */
  parent_comment?: CommentItem | null;
  /** 回复数量 */
  replies_count?: number;
};

/**
 * 评论列表响应
 */
export type CommentListResponse = {
  list: CommentItem[];
  total?: number;
  [key: string]: unknown;
};

/**
 * 获取评论列表参数
 * GET /api/wallpapers/comments/
 */
export type GetCommentsParams = {
  /** 当前页码 */
  currentPage: number;
  /** 每页数量 */
  pageSize: number;
  /** 壁纸ID */
  wallpaper_id: number | string;
};

/**
 * 获取评论列表
 * GET /api/wallpapers/comments/list/
 */
export function getComments(params: GetCommentsParams) {
  return http.get<CommentListResponse>('/api/wallpapers/comments/list/', { params });
}

/**
 * 发表评论请求参数
 * POST /api/wallpapers/comments/
 */
export type CreateCommentParams = {
  /** 壁纸ID */
  wallpaper_id: number | string;
  /** 评论内容 */
  content: string;
  /** 回复的评论ID（可选，如果是回复评论） */
  parent_id?: number;
};

/**
 * 发表评论
 * POST /api/wallpapers/comments/
 */
export function createComment(data: CreateCommentParams) {
  return http.post<CommentItem>('/api/wallpapers/comments/', data);
}

/**
 * 评论点赞/取消点赞
 * POST /api/wallpapers/comments/{id}/toggle-like/
 * @param commentId - 评论ID
 */
export function toggleCommentLike(commentId: number | string) {
  return http.post<CommentItem>(`/api/wallpapers/comments/${commentId}/toggle-like/`);
}

/**
 * 删除评论
 * DELETE /api/wallpapers/comments/{id}/
 * @param commentId - 评论ID
 */
export function deleteComment(commentId: number | string) {
  return http.delete<void>(`/api/wallpapers/comments/${commentId}/`);
}

/**
 * 消息通知类型
 */
export type NotificationItem = {
  /** 消息ID */
  id: number;
  /** 消息类型 */
  type?: string;
  /** 通知类型 (like, reply, comment, system等) */
  notification_type?: string;
  /** 消息标题 */
  title?: string;
  /** 消息内容 */
  content?: string;
  /** 消息显示内容（系统通知专用） */
  content_display?: string;
  /** 是否已读 */
  is_read?: boolean;
  /** 关联的壁纸ID */
  wallpaper_id?: number | string;
  /** 关联的评论ID */
  comment_id?: number | string;
  /** 发送者信息 */
  sender?: {
    id: number;
    username: string;
    nickname: string;
    avatar_url?: string;
  };
  /** 额外数据 */
  extra_data?: {
    /** 回复内容 */
    reply_content?: string;
    /** 通用内容 */
    content?: string;
    /** 其他字段 */
    [key: string]: unknown;
  };
  /** 创建时间 */
  created_at?: string;
};

/**
 * 消息列表响应
 */
export type NotificationListResponse = {
  list?: NotificationItem[];
  results?: NotificationItem[];
  total?: number;
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  [key: string]: unknown;
};

/**
 * 获取消息列表参数
 */
export type NotificationsListParams = {
  currentPage: number;
  pageSize: number;
};

/**
 * 获取消息列表
 * GET /api/notifications/
 * @param params - 分页参数
 */
export function getNotificationsList(params: NotificationsListParams) {
  return http.get<NotificationListResponse>('/api/notifications/', { 
    params: {
      currentPage: params.currentPage,
      pageSize: params.pageSize,
    }
  });
}

/**
 * 获取未读消息数量
 * GET /api/notifications/unread-count/
 */
export function getUnreadNotificationCount() {
  return http.get<{ data: { count: number } }>('/api/notifications/unread-count/');
}

/**
 * 标记消息为已读
 * POST /api/notifications/mark-read/
 * @param notificationId - 消息ID
 */
export function markNotificationAsRead(notificationId: number | string) {
  return http.post<void>('/api/notifications/mark-read/', {
    id: notificationId,
  });
}

/**
 * 标记所有消息为已读
 * POST /api/notifications/mark-read/
 */
export function markAllNotificationsAsRead() {
  return http.post<void>('/api/notifications/mark-read/', {
    id: 'all',
  });
}

/**
 * 删除消息
 * DELETE /api/notifications/{id}/
 * @param notificationId - 消息ID
 */
export function deleteNotification(notificationId: number | string) {
  return http.delete<void>(`/api/notifications/${notificationId}/`);
}

/**
 * 关注/粉丝用户数据类型
 * 根据实际接口返回格式定义
 */
export type FollowUserItem = {
  /** 用户ID */
  id: number | string;
  /** 邮箱 */
  email?: string;
  /** 昵称 */
  nickname?: string;
  /** 性别: 1-男, 2-女, 其他-未知 */
  gender?: number;
  /** 头像URL */
  avatar_url?: string | null;
  /** 头像（备用字段） */
  avatar?: string;
  /** 用户名（备用字段） */
  username?: string;
  /** 是否已关注（用于粉丝列表判断是否回关） */
  is_followed?: boolean;
  is_following?: boolean;
  /** 上传数量 */
  upload_count?: number;
  /** 收藏数量 */
  collection_count?: number;
  /** 粉丝数量 */
  follower_count?: number;
  /** 等级 */
  level?: number;
  /** 积分 */
  points?: number;
  [key: string]: unknown;
};

/**
 * 分页信息
 */
export type PaginationInfo = {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
  /** 总数 */
  total: number;
  /** 总页数 */
  total_pages: number;
};

/**
 * 关注/粉丝列表响应
 * 根据实际接口返回格式定义
 * 完整格式: { code: 200, message: "success", data: { pagination: {...}, results: [...] } }
 */
export type FollowListResponse = {
  code?: number;
  message?: string;
  data?: {
    /** 分页信息 */
    pagination?: PaginationInfo;
    /** 用户列表 */
    results?: FollowUserItem[];
    /** 总数（兼容字段） */
    total?: number;
    [key: string]: unknown;
  };
  /** 分页信息（兼容直接返回的格式） */
  pagination?: PaginationInfo;
  /** 用户列表（兼容直接返回的格式） */
  results?: FollowUserItem[];
  [key: string]: unknown;
};

/**
 * 获取关注列表参数
 * GET /api/wallpapers/followers/
 */
export type FollowingListParams = {
  /** 当前页码 */
  currentPage: number;
  /** 每页数量 */
  pageSize: number;
};

/**
 * 获取关注列表
 * GET /api/wallpapers/followers/
 */
export function getFollowingList(params: FollowingListParams) {
  return http.get<FollowListResponse>('/api/wallpapers/followers/', { params });
}

/**
 * 获取粉丝列表参数
 * GET /api/wallpapers/followers/my-followers/
 */
export type FollowersListParams = {
  /** 当前页码 */
  currentPage: number;
  /** 每页数量 */
  pageSize: number;
};

/**
 * 获取粉丝列表
 * GET /api/wallpapers/followers/my-followers/
 */
export function getFollowersList(params: FollowersListParams) {
  return http.get<FollowListResponse>('/api/wallpapers/followers/my-followers/', { params });
}

/**
 * 关注/取消关注用户
 * POST /api/wallpapers/followers/toggle/
 * @param followingId - 用户ID（关注列表/粉丝列表中的id）
 */
export function toggleFollowUser(followingId: number | string) {
  console.log('=== [toggleFollowUser] 调试信息 ===');
  console.log('🔵 传入的 followingId:', followingId);
  console.log('🔵 followingId 类型:', typeof followingId);
  console.log('🔵 followingId 是否为空:', !followingId);
  console.log('🔵 followingId 是否为 undefined:', followingId === undefined);
  console.log('🔵 followingId 是否为 null:', followingId === null);
  
  // 验证参数
  if (!followingId && followingId !== 0) {
    console.error('❌ 错误: followingId 为空或未定义！');
    console.error('   请检查调用处是否正确传递了 user.id');
    throw new Error('followingId 不能为空');
  }
  
  const requestData = { following_id: followingId };
  console.log('📦 请求数据 requestData:', requestData);
  console.log('📦 following_id 的值:', requestData.following_id);
  console.log('=====================================');
  
  return http.post<{ is_followed: boolean }>(`/api/wallpapers/followers/toggle/`, requestData);
}
