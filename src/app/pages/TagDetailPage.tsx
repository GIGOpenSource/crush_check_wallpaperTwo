import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
import type { Tag } from '../types';
import type { TagDetailLocationState } from '../types/tagDetailNav';
import { ChevronLeft, SlidersHorizontal, Calendar, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTagWallpapersList } from '../hooks/useTagWallpapersList';

type SortOption = 'relevance' | 'latest' | 'views' | 'downloads';

export default function TagDetailPage() {
  const { t } = useLanguage();
  const { tagId: tagIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const state = location.state as TagDetailLocationState | null;
  const meta = state?.tagMeta;

  const decodedId = tagIdParam ? decodeURIComponent(tagIdParam).trim() : '';

  // 将sortBy转换为API order参数
  const apiOrder = sortBy === 'relevance' ? undefined : sortBy;

  const { wallpapers, total, loading, loadingMore, error, sentinelRef, listNavBase } =
    useTagWallpapersList(decodedId || undefined, apiOrder);

  const displayTag: Tag | null = decodedId
    ? {
        tag: decodedId,
        name: meta?.name ?? decodedId,
        description: meta?.description,
        wallpaperCount: meta?.wallpaperCount ?? total ?? wallpapers.length,
      }
    : null;

  if (!displayTag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t.tags.tagNotFound}</p>
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string; icon: typeof SlidersHorizontal }[] = [
    { value: 'relevance', label: t.tags.relevance, icon: SlidersHorizontal },
    { value: 'latest', label: t.tags.latest, icon: Calendar },
    { value: 'views', label: t.tags.mostViewed, icon: Eye },
    { value: 'downloads', label: t.tags.mostDownloaded, icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">#{displayTag.name}</h1>
            <p className="text-sm text-gray-500">
              {formatNumber(displayTag.wallpaperCount)} {t.tags.wallpapers}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {displayTag.description && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-600">{displayTag.description}</p>
          </div>
        )}

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
                        type="button"
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

      <div className="py-4">
        {loading && wallpapers.length === 0 && (
          <p className="text-center text-gray-500 py-12">{t.common.loading}</p>
        )}
        {error && wallpapers.length === 0 && !loading && (
          <p className="text-center text-red-500 py-12 px-4">{t.common.loadFailed}</p>
        )}
        {!loading && !error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">{t.tags.noWallpapersWithTag}</p>
          </div>
        )}
        {wallpapers.length > 0 && (
          <>
            <WallpaperGrid wallpapers={wallpapers} listNavBase={listNavBase} />
            {loadingMore && (
              <p className="text-center text-sm text-gray-500 py-4">{t.common.loading}</p>
            )}
            <div ref={sentinelRef} className="h-10" aria-hidden />
          </>
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
