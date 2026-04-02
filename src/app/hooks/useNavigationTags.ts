import { useEffect, useState } from 'react';
import { getNavigationTags } from '../../api/wallpaper';
import type { Tag } from '../types';
import { mapNavigationTagResponseToTags } from '../utils/navigationTagApiMap';

type Options = {
  isHot: boolean;
  pageSize: number;
  currentPage?: number;
};

export function useNavigationTags({ isHot, pageSize, currentPage = 1 }: Options) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getNavigationTags({ currentPage, pageSize, isHot })
      .then((raw) => {
        if (cancelled) return;
        setTags(mapNavigationTagResponseToTags(raw));
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
  }, [isHot, pageSize, currentPage]);

  return { tags, loading, error };
}
