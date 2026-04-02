import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Wallpaper } from '../types';
import { useWallpaperListCardTracking } from '../hooks/useWallpaperListCardTracking';

type Props = {
  wallpaper: Wallpaper;
  className?: string;
  children: ReactNode;
};

/** 首页编辑推荐轮播：与网格列表一致的 wallpaper_click / wallpaper_hover */
export function EditorsPickWallpaperLink({ wallpaper, className, children }: Props) {
  const { rootRef, onClickTrack, onHoverTrack } = useWallpaperListCardTracking(wallpaper.id, true);
  return (
    <div ref={rootRef} className={className} onMouseEnter={onHoverTrack}>
      <Link to={`/wallpaper/${wallpaper.id}`} className="block" onClick={onClickTrack}>
        {children}
      </Link>
    </div>
  );
}
