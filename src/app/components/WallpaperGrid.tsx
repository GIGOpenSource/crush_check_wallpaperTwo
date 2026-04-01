import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, Download, Heart } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  columns?: number;
}

export function WallpaperGrid({ wallpapers, columns = 2 }: WallpaperGridProps) {
  return (
    <div
      className="grid gap-3 px-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {wallpapers.map((wallpaper, index) => (
        <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={index} />
      ))}
    </div>
  );
}

function WallpaperCard({ wallpaper, index }: { wallpaper: Wallpaper; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/wallpaper/${wallpaper.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 group">
          <img
            src={wallpaper.imageUrl}
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

          {/* Resolution badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
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
