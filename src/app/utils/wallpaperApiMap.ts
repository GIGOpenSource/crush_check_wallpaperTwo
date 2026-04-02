import { API_BASE_URL } from '../../api/request';
import type { User, Wallpaper } from '../types';

const listUploaderPlaceholder: User = {
  id: '0',
  username: '—',
  avatar: '',
  level: 0,
  points: 0,
  badges: [],
  uploadedCount: 0,
  favoritesCount: 0,
};

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== '') return String(v);
  }
  return '';
}

function pickNum(obj: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapUserFromApi(raw: unknown): User {
  if (!raw || typeof raw !== 'object') return listUploaderPlaceholder;
  const o = raw as Record<string, unknown>;
  return {
    id: String(o.id ?? '0'),
    username: String(o.username ?? o.name ?? '—'),
    avatar: String(o.avatar ?? o.avatar_url ?? ''),
    level: typeof o.level === 'number' ? o.level : 0,
    points: typeof o.points === 'number' ? o.points : 0,
    badges: [],
    uploadedCount: 0,
    favoritesCount: 0,
  };
}

/** 兼容 list / results / data / Django 分页等常见结构 */
export function extractWallpaperItemsFromResponse(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data !== 'object') return [];
  const o = data as Record<string, unknown>;
  const nested = o.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    if (Array.isArray(inner.list)) return inner.list as Record<string, unknown>[];
    if (Array.isArray(inner.results)) return inner.results as Record<string, unknown>[];
    if (Array.isArray(inner.records)) return inner.records as Record<string, unknown>[];
  }
  if (Array.isArray(o.list)) return o.list as Record<string, unknown>[];
  if (Array.isArray(o.results)) return o.results as Record<string, unknown>[];
  if (Array.isArray(o.records)) return o.records as Record<string, unknown>[];
  if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  return [];
}

export function mapRecordToWallpaper(item: Record<string, unknown>): Wallpaper {
  const id =
    pickStr(item, ['id', 'wallpaper_id', 'pk']) || String(pickNum(item, ['id'], 0) || '');
  const title = pickStr(item, ['title', 'name']) || 'Wallpaper';
  let imageUrl = pickStr(item, [
    'imageUrl',
    'image_url',
    'cover',
    'cover_url',
    'thumbnail',
    'thumb',
    'url',
    'img',
    'image',
  ]);
  imageUrl = resolveMediaUrl(imageUrl);

  const tagsRaw = item.tags;
  const tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    for (const t of tagsRaw) {
      if (typeof t === 'string') tags.push(t);
      else if (t && typeof t === 'object' && 'name' in t) tags.push(String((t as { name: unknown }).name));
    }
  }

  const uploader = item.uploader ?? item.author ?? item.user;

  return {
    id,
    title,
    imageUrl,
    resolution: pickStr(item, ['resolution', 'size']) || '—',
    fileSize: pickStr(item, ['fileSize', 'file_size', 'size_label']) || '—',
    uploadDate: pickStr(item, ['uploadDate', 'upload_date', 'created_at', 'create_time']) || '',
    uploader: mapUserFromApi(uploader),
    tags,
    views: pickNum(item, ['views', 'view_count', 'view']),
    downloads: pickNum(item, ['downloads', 'download_count']),
    likes: pickNum(item, ['likes', 'like_count']),
    favorites: pickNum(item, ['favorites', 'favorite_count']),
    aspectRatio: pickStr(item, ['aspectRatio', 'aspect_ratio']) || '16:9',
    colors: Array.isArray(item.colors) ? (item.colors as unknown[]).map(String) : [],
    purity: 'SFW',
  };
}
