import type { Tag } from '../types';

/** 标签列表展示文案：优先 nav_name，不用 id */
export function getTagDisplayName(tag: Tag): string {
  const nav = tag.navName?.trim();
  if (nav) return nav;
  const n = tag.name?.trim();
  if (n && n !== String(tag.tag)) return n;
  return n || '';
}
