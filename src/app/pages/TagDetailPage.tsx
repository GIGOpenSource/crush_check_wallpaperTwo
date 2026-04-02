import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { mockWallpapers, mockTags } from '../mockData';
import { ChevronLeft, SlidersHorizontal, Calendar, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type SortOption = 'relevance' | 'date' | 'views' | 'downloads';

export default function TagDetailPage() {
  const { t } = useLanguage();
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const tag = mockTags.find((tg) => tg.name === tagName);
  const tagWallpapers = mockWallpapers.filter((w) => w.tags.includes(tagName || ''));

  // Sort wallpapers
  const sortedWallpapers = [...tagWallpapers].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'views':
        return b.views - a.views;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return 0;
    }
  });

  if (!tag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t.tags.tagNotFound}</p>
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string; icon: typeof SlidersHorizontal }[] = [
    { value: 'relevance', label: t.tags.relevance, icon: SlidersHorizontal },
    { value: 'date', label: t.tags.latest, icon: Calendar },
    { value: 'views', label: t.tags.mostViewed, icon: Eye },
    { value: 'downloads', label: t.tags.mostDownloaded, icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">#{tag.name}</h1>
            <p className="text-sm text-gray-500">
              {formatNumber(tag.wallpaperCount)} {t.tags.wallpapers}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Description */}
        {tag.description && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-600">{tag.description}</p>
          </div>
        )}

        {/* Sort Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-200"
            >
              <div className="px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.tags.sortBy}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowFilters(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          sortBy === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Wallpapers Grid */}
      <div className="py-4">
        {sortedWallpapers.length > 0 ? (
          <WallpaperGrid wallpapers={sortedWallpapers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">{t.tags.noWallpapersWithTag}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}