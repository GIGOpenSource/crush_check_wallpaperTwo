import type { Tag } from '../types';
import { extractWallpaperItemsFromResponse } from './wallpaperApiMap';

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

export function mapRecordToTag(item: Record<string, unknown>): Tag | null {
  // 优先使用 name 字段，因为 API 返回的是 name 而不是 tag
  const nameRaw = pickStr(item, ['name', 'tag_name', 'title', 'label']).trim();
  const navName = pickStr(item, ['nav_name', 'navName']).trim();
  const name = nameRaw || navName;
  
  // 如果没有 name，返回 null
  if (!name) return null;

  const id = pickStr(item, ['id', 'tag_id', 'pk']).trim();

  return {
    tag: name,  // 使用 name 作为 tag 标识
    id: id || undefined,
    name: name || navName,
    navName: navName || undefined,
    description: pickStr(item, ['description', 'desc', 'intro']) || undefined,
    wallpaperCount: pickNum(item, [
      'wallpaperCount',
      'wallpaper_count',
      'count',
      'num',
      'total',
      'wallpaper_num',
    ]),
  };
}

export function mapNavigationTagResponseToTags(data: unknown): Tag[] {
  const items = extractWallpaperItemsFromResponse(data);
  return items.map(mapRecordToTag).filter((t): t is Tag => t != null);
}

export function buildTagIdMap(data: unknown): Record<string, string> {
  const tags = mapNavigationTagResponseToTags(data);
  const map: Record<string, string> = {};
  for (const tag of tags) {
    if (tag.id) {
      // 优先使用 tag 字段作为 key，如果不存在则使用 name
      const key = tag.tag || tag.name;
      if (key) {
        map[key] = tag.id;
      }
    }
  }
  return map;
}
