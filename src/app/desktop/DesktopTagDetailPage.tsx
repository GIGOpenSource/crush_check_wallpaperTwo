import { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import type { Tag } from '../types';
import type { TagDetailLocationState } from '../types/tagDetailNav';
import { ChevronLeft, SlidersHorizontal, Calendar, Eye, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTagWallpapersList } from '../hooks/useTagWallpapersList';

type SortOption = 'relevance' | 'date' | 'views' | 'downloads';

export default function DesktopTagDetailPage() {
  const { t } = useLanguage();
  const { tagId: tagIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const state = location.state as TagDetailLocationState | null;
  const meta = state?.tagMeta;

  const decodedId = tagIdParam ? decodeURIComponent(tagIdParam).trim() : '';

  const { wallpapers, total, loading, loadingMore, error, sentinelRef, listNavBase } =
    useTagWallpapersList(decodedId || undefined);

  const displayTag: Tag | null = decodedId
    ? {
        tag: decodedId,
        name: meta?.name ?? decodedId,
        description: meta?.description,
        wallpaperCount: meta?.wallpaperCount ?? total ?? wallpapers.length,
      }
    : null;

  const sortedWallpapers = useMemo(() => {
    const list = [...wallpapers];
    switch (sortBy) {
      case 'date':
        return list.sort(
          (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        );
      case 'views':
        return list.sort((a, b) => b.views - a.views);
      case 'downloads':
        return list.sort((a, b) => b.downloads - a.downloads);
      default:
        return list;
    }
  }, [wallpapers, sortBy]);

  if (!displayTag) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">{t.tags.tagNotFound}</p>
        </div>
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
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">#{displayTag.name}</h1>
                  <p className="text-gray-600 mt-1">
                    {formatNumber(displayTag.wallpaperCount)} {t.tags.wallpapers}
                  </p>
                </div>
              </div>

              {displayTag.description && (
                <p className="text-gray-600 mb-4">{displayTag.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{t.tags.sortBy}</span>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {loading && wallpapers.length === 0 && (
              <p className="text-center text-gray-500 py-20">{t.common.loading}</p>
            )}
            {error && wallpapers.length === 0 && !loading && (
              <p className="text-center text-red-500 py-20">{t.common.loadFailed}</p>
            )}
            {!loading && !error && sortedWallpapers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal size={40} className="text-gray-400" />
                </div>
                <p className="text-xl text-gray-500 mb-2">{t.searchPage.noWallpapersFound}</p>
                <p className="text-gray-400">{t.tags.noWallpapersWithTag}</p>
              </div>
            )}
            {sortedWallpapers.length > 0 && (
              <>
                <DesktopWallpaperGrid
                  wallpapers={sortedWallpapers}
                  columns={4}
                  listNavBase={listNavBase}
                />
                {loadingMore && (
                  <p className="text-center text-sm text-gray-500 py-6">{t.common.loading}</p>
                )}
                <div ref={sentinelRef} className="h-10" aria-hidden />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
