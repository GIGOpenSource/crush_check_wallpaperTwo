import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, Download, Heart, Trash2 } from 'lucide-react';
import { Wallpaper } from '../types';
import type { WallpaperListNavBase } from '../types/wallpaperListNav';
import { WALLPAPER_LIST_NAV_KEY } from '../types/wallpaperListNav';
import { useWallpaperListCardTracking } from '../hooks/useWallpaperListCardTracking';
import { wallpaperListCoverUrl } from '../utils/wallpaperApiMap';

interface UploadWallpaperGridProps {
  wallpapers: Wallpaper[];
  columns?: number;
  /** 从列表进详情时携带，与列表接口筛选一致；卡片会带上当前项序号（第 N 条） */
  listNavBase?: WallpaperListNavBase;
  /** 列表点击、桌面悬停埋点（不含列表曝光） */
  trackListEvents?: boolean;
  /** 删除壁纸回调 */
  onDelete: (id: number | string) => void;
  /** 正在删除的壁纸ID */
  deletingId?: number | string | null;
}

export function UploadWallpaperGrid({
  wallpapers,
  columns = 2,
  listNavBase,
  trackListEvents = true,
  onDelete,
  deletingId,
}: UploadWallpaperGridProps) {
  return (
    <div
      className="grid gap-3 px-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {wallpapers.map((wallpaper, index) => (
        <UploadWallpaperCard
          key={wallpaper.id}
          wallpaper={wallpaper}
          index={index}
          listNavBase={listNavBase}
          trackListEvents={trackListEvents}
          onDelete={onDelete}
          isDeleting={deletingId === wallpaper.id}
        />
      ))}
    </div>
  );
}

function UploadWallpaperCard({
  wallpaper,
  index,
  listNavBase,
  trackListEvents,
  onDelete,
  isDeleting,
}: {
  wallpaper: Wallpaper;
  index: number;
  listNavBase?: WallpaperListNavBase;
  trackListEvents: boolean;
  onDelete: (id: number | string) => void;
  isDeleting: boolean;
}) {
  const { rootRef, onClickTrack, onHoverTrack } = useWallpaperListCardTracking(
    wallpaper.id,
    trackListEvents,
  );
  const listState =
    listNavBase != null
      ? { [WALLPAPER_LIST_NAV_KEY]: { ...listNavBase, listItemPosition: index + 1 } }
      : undefined;

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={onHoverTrack}
      className="relative"
    >
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(wallpaper.id);
        }}
        disabled={isDeleting}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>

      <Link
        to={`/wallpaper/${wallpaper.id}`}
        state={listState}
        className="block"
        onClick={onClickTrack}
      >
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 group">
          <img
            src={wallpaperListCoverUrl(wallpaper)}
            alt={wallpaper.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white text-sm font-medium mb-2 line-clamp-1">
                {wallpaper.title}
              </h3>
              <div className="flex items-center gap-3 text-white/90 text-xs">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{formatNumber(wallpaper.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={14} />
                  <span>{formatNumber(wallpaper.downloads)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={14} />
                  <span>{formatNumber(wallpaper.likes)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution badge - 移到左边 */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            {wallpaper.resolution}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
