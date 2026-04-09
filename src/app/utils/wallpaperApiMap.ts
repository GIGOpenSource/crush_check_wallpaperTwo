import { API_BASE_URL } from '../../api/request';
import type { User, Wallpaper, WallpaperTag } from '../types';

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

/** 详情/列表分辨率：优先用接口宽高拼成「宽x高」，否则回退 resolution / size 字段 */
function resolutionFromItem(item: Record<string, unknown>): string {
  const w = pickNum(item, ['width', 'w', 'img_width', 'image_width']);
  const h = pickNum(item, ['height', 'h', 'img_height', 'image_height']);
  if (w > 0 && h > 0) {
    return `${w}x${h}`;
  }
  return pickStr(item, ['resolution', 'size']) || '—';
}

function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** 列表/轮播封面：优先缩略图，否则原图 */
export function wallpaperListCoverUrl(w: Wallpaper): string {
  return w.thumbUrl || w.imageUrl;
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
    'url',
    'imageUrl',
    'image_url',
    'cover',
    'cover_url',
    'img',
    'image',
  ]);
  imageUrl = resolveMediaUrl(imageUrl);

  let thumbUrl = pickStr(item, ['thumb_url', 'thumbnail', 'thumb']);
  thumbUrl = resolveMediaUrl(thumbUrl);
  if (!thumbUrl) thumbUrl = imageUrl;
  if (!imageUrl) imageUrl = thumbUrl;

  const tagsRaw = item.tags;
  const tags: WallpaperTag[] = [];
  if (Array.isArray(tagsRaw)) {
    for (const t of tagsRaw) {
      if (typeof t === 'string') {
        const s = t.trim();
        if (s) tags.push({ id: s, name: s });
      } else if (t && typeof t === 'object') {
        const o = t as Record<string, unknown>;
        const name = pickStr(o, ['name', 'nav_name', 'label', 'title', 'tag_name']).trim();
        const id = pickStr(o, ['id', 'tag_id', 'pk']).trim();
        if (id && name) tags.push({ id, name });
        else if (id) tags.push({ id, name: id });
        else if (name) tags.push({ id: name, name });
      }
    }
  }

  const uploader = item.uploader ?? item.author ?? item.user;

  return {
    id,
    title,
    imageUrl,
    thumbUrl,
    resolution: resolutionFromItem(item),
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
