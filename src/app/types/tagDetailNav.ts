/** 从标签列表点进详情时通过 location.state 传递展示用信息（刷新后可能仅有路由上的 tagId） */
export type TagDetailLocationState = {
  tagMeta?: {
    name: string;
    wallpaperCount?: number;
    description?: string;
  };
};
