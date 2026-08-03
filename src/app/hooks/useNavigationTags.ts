import { useEffect, useState, useCallback, useRef } from 'react';
import { getHotTags, getAllTags } from '../../api/wallpaper';
import type { Tag } from '../types';
import { mapNavigationTagResponseToTags } from '../utils/navigationTagApiMap';
import { tagCache } from '../utils/tagCache';

type Options = {
  isHot: boolean;
};

type NavTagsSnapshot = {
  tags: Tag[];
  ready: boolean;
};

/** 跨路由保留标签列表，避免从标签详情返回时重复请求 */
const navigationTagsCache = new Map<boolean, NavTagsSnapshot>();

export function useNavigationTags({ isHot }: Options) {
  const [tags, setTags] = useState<Tag[]>(() => navigationTagsCache.get(isHot)?.tags ?? []);
  const [loading, setLoading] = useState(() => !navigationTagsCache.get(isHot)?.ready);
  const [error, setError] = useState(false);
  const fetchingRef = useRef(false);

  const fetchData = useCallback((useCache = true) => {
    // 如果使用缓存且有缓存数据，直接返回
    if (useCache) {
      const cached = navigationTagsCache.get(isHot);
      if (cached?.ready) {
        setTags(cached.tags);
        setError(false);
        setLoading(false);
        tagCache.addTags(cached.tags);
        return;
      }
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchFn = isHot ? getHotTags : getAllTags;
    
    fetchFn()
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapNavigationTagResponseToTags(raw);
        setTags(mapped);
        navigationTagsCache.set(isHot, { tags: mapped, ready: true });
        tagCache.addTags(mapped);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setTags([]);
        }
      })
      .finally(() => {
        fetchingRef.current = false;
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isHot]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const refresh = useCallback(() => {
    // 清除缓存，强制重新加载
    navigationTagsCache.delete(isHot);
    fetchData(false);
  }, [fetchData, isHot]);

  return { tags, loading, error, refresh };
}
