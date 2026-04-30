import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const cached = navigationTagsCache.get(isHot);
    if (cached?.ready) {
      setTags(cached.tags);
      setError(false);
      setLoading(false);
      // 即使使用缓存，也需要确保标签缓存管理器中有数据
      tagCache.addTags(cached.tags);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    // 根据 isHot 参数选择不同的接口，无需参数
    const fetchFn = isHot ? getHotTags : getAllTags;
    
    fetchFn()
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapNavigationTagResponseToTags(raw);
        setTags(mapped);
        navigationTagsCache.set(isHot, { tags: mapped, ready: true });
        // 将标签数据添加到缓存管理器中
        tagCache.addTags(mapped);
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
  }, [isHot]);

  return { tags, loading, error };
}
