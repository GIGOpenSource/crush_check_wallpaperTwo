import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, Download, Heart } from 'lucide-react';
import { Wallpaper } from '../types';

interface DesktopWallpaperGridProps {
  wallpapers: Wallpaper[];
  columns?: number;
}

export function DesktopWallpaperGrid({ wallpapers, columns = 4 }: DesktopWallpaperGridProps) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {wallpapers.map((wallpaper, index) => (
        <DesktopWallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={index} />
      ))}
    </div>
  );
}

function DesktopWallpaperCard({ wallpaper, index }: { wallpaper: Wallpaper; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/wallpaper/${wallpaper.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 group shadow-md hover:shadow-xl transition-shadow">
          <img
            src={wallpaper.imageUrl}
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

          {/* Resolution badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-medium">
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
