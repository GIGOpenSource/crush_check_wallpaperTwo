import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, Download, Heart, Trash2 } from 'lucide-react';
import { Wallpaper } from '../types';
import type { WallpaperListNavBase } from '../types/wallpaperListNav';
import { WALLPAPER_LIST_NAV_KEY } from '../types/wallpaperListNav';
import { useWallpaperListCardTracking } from '../hooks/useWallpaperListCardTracking';
import { wallpaperListCoverUrl } from '../utils/wallpaperApiMap';

interface DesktopWallpaperGridProps {
  wallpapers: Wallpaper[];
  columns?: number;
  listNavBase?: WallpaperListNavBase;
  /** 列表点击、桌面悬停埋点（不含列表曝光） */
  trackListEvents?: boolean;
  /** 删除壁纸回调（可选，仅在需要删除功能时传入） */
  onDelete?: (id: number | string) => void;
  /** 正在删除的壁纸ID */
  deletingId?: number | string | null;
}

export function DesktopWallpaperGrid({
  wallpapers,
  columns = 4,
  listNavBase,
  trackListEvents = true,
  onDelete,
  deletingId,
}: DesktopWallpaperGridProps) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {wallpapers.map((wallpaper, index) => (
        <DesktopWallpaperCard
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

function DesktopWallpaperCard({
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
  onDelete?: (id: number | string) => void;
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
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      onMouseEnter={onHoverTrack}
      className="relative"
    >
      {/* 删除按钮 - 仅当传入 onDelete 时显示 */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(wallpaper.id);
          }}
          disabled={isDeleting}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      )}

      <Link
        to={`/wallpaper/${wallpaper.id}`}
        state={listState}
        className="block"
        onClick={onClickTrack}
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 group shadow-md hover:shadow-xl transition-shadow">
          <img
            src={wallpaperListCoverUrl(wallpaper)}
            alt={wallpaper.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold mb-2 line-clamp-2">
                {wallpaper.title}
              </h3>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{formatNumber(wallpaper.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={16} />
                  <span>{formatNumber(wallpaper.downloads)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={16} />
                  <span>{formatNumber(wallpaper.likes)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution badge - 当有删除按钮时移到左边 */}
          <div className={`absolute top-3 ${onDelete ? 'left-3' : 'right-3'} bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-medium`}>
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
