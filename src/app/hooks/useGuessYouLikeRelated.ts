import { useEffect, useState } from 'react';
import { guessLike } from '../../api/wallpaper';
import type { Wallpaper } from '../types';
import {
  extractWallpaperItemsFromResponse,
  mapRecordToWallpaper,
  wallpaperListCoverUrl,
} from '../utils/wallpaperApiMap';

export function useGuessYouLikeRelated(wallpaperId: string | undefined) {
  const [relatedWallpapers, setRelatedWallpapers] = useState<Wallpaper[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!wallpaperId) {
      setRelatedWallpapers([]);
      return;
    }
    let cancelled = false;
    setLoadingRelated(true);

    guessLike(wallpaperId)
      .then((raw) => {
        if (cancelled) return;
        const mapped = extractWallpaperItemsFromResponse(raw)
          .map(mapRecordToWallpaper)
          .filter(
            (w) =>
              w.id && wallpaperListCoverUrl(w) && String(w.id) !== String(wallpaperId),
          );
        setRelatedWallpapers(mapped);
      })
      .catch(() => {
        if (!cancelled) setRelatedWallpapers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRelated(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wallpaperId]);

  return { relatedWallpapers, loadingRelated };
}
