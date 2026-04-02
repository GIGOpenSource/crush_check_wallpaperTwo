import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { getWallpaperByListPosition } from '../../api/wallpaper';
import { mockWallpapers } from '../mockData';
import type { Wallpaper } from '../types';
import { parseWallpaperListNav } from '../types/wallpaperListNav';
import { extractWallpaperItemsFromResponse, mapRecordToWallpaper } from '../utils/wallpaperApiMap';

export function useWallpaperDetailFromRoute() {
  const { id } = useParams();
  const location = useLocation();

  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  /** 首帧 true，避免未跑 effect 时误判「未找到」 */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const parsed = parseWallpaperListNav(location.state);

    if (parsed) {
      setLoading(true);
      setError(false);
      setWallpaper(null);

      getWallpaperByListPosition(parsed.listItemPosition, {
        platform: parsed.platform,
        media_live: parsed.media_live,
        name: parsed.name,
        tag_id: parsed.tag_id,
      })
        .then((raw) => {
          if (cancelled) return;
          const items = extractWallpaperItemsFromResponse(raw);
          const mapped = items.map(mapRecordToWallpaper).filter((w) => w.id && w.imageUrl);
          const first = mapped[0];
          if (first) setWallpaper(first);
          else setError(true);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    const w = mockWallpapers.find((x) => x.id === id);
    setWallpaper(w ?? null);
    setLoading(false);
    setError(!w);
  }, [id, location.state]);

  return { wallpaper, loading, error };
}
