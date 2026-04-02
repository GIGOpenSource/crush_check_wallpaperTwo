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
  const listTag = pickStr(item, ['tag']).trim();
  if (!listTag) return null;

  const id = pickStr(item, ['id', 'tag_id', 'pk']).trim();

  const navName = pickStr(item, ['nav_name', 'navName']).trim();
  const nameRaw = pickStr(item, ['name', 'tag_name', 'title', 'label']).trim();
  const name = nameRaw || navName;

  return {
    tag: listTag,
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
