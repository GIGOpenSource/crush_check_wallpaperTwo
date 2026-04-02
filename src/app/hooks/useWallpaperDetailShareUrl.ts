import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import { buildWallpaperShareUrl, resolveWallpaperListNav } from '../types/wallpaperListNav';

/** 当前详情页的完整分享 URL（含列表 pos / platform / 筛选等 query，与复制链接一致） */
export function useWallpaperDetailShareUrl() {
  const { id } = useParams();
  const location = useLocation();

  const listNav = useMemo(
    () => resolveWallpaperListNav(location.state, location.search),
    [location.state, location.search]
  );

  return useMemo(() => {
    if (!id) return '';
    return buildWallpaperShareUrl(id, listNav);
  }, [id, listNav]);
}
