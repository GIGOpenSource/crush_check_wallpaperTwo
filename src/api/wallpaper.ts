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
