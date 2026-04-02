import { useEffect, useMemo, useState } from 'react';
import { getNavigationTags } from '../../api/wallpaper';
import type { Tag } from '../types';
import { mapNavigationTagResponseToTags } from '../utils/navigationTagApiMap';

type Options = {
  isHot: boolean;
  pageSize: number;
  currentPage?: number;
};

type NavTagsSnapshot = {
  tags: Tag[];
  ready: boolean;
};

/** 跨路由保留标签列表，避免从标签详情返回时重复请求 */
const navigationTagsCache = new Map<string, NavTagsSnapshot>();

function cacheKey(isHot: boolean, pageSize: number, currentPage: number): string {
  return `${isHot ? '1' : '0'}:${pageSize}:${currentPage}`;
}

export function useNavigationTags({ isHot, pageSize, currentPage = 1 }: Options) {
  const key = useMemo(
    () => cacheKey(isHot, pageSize, currentPage),
    [isHot, pageSize, currentPage],
  );

  const [tags, setTags] = useState<Tag[]>(() => navigationTagsCache.get(key)?.tags ?? []);
  const [loading, setLoading] = useState(() => !navigationTagsCache.get(key)?.ready);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = navigationTagsCache.get(key);
    if (cached?.ready) {
      setTags(cached.tags);
      setError(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getNavigationTags({ currentPage, pageSize, isHot })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapNavigationTagResponseToTags(raw);
        setTags(mapped);
        navigationTagsCache.set(key, { tags: mapped, ready: true });
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setTags([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, currentPage, pageSize, isHot]);

  return { tags, loading, error };
}
