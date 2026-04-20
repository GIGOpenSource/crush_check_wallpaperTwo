import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { SearchBar } from '../components/SearchBar';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useSearchEmptyTrack } from '../hooks/useSearchEmptyTrack';
import { useLanguage } from '../contexts/LanguageContext';
import { tpl } from '../utils/format';
import { getTagDisplayName } from '../utils/tagDisplay';
import { useSearchWallpapers, SearchFilters } from '../hooks/useSearchWallpapers';

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    resolution: [],
    aspectRatio: [],
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // 使用真实 API 获取壁纸数据
  const {
    wallpapers: filteredWallpapers,
    loading,
    error,
    hasMore,
    loadMore,
    totalCount,
    currentPage,
  } = useSearchWallpapers(query, filters, 1, 20, 'PHONE');

  // 搜索建议标签 - 暂时禁用
  const suggestedTags: any[] = [];
  // const { tags: suggestedTags } = useSearchSuggestions(query);

  const resolutionOptions = ['3840x2160', '2560x1440', '1920x1080'];
  const aspectRatioOptions = ['16:9', '21:9', '9:16'];

  const toggleFilter = <K extends keyof SearchFilters>(
    category: K,
    value: SearchFilters[K][number]
  ) => {
    umengclick('filter_click_type');
    setFilters((prev) => {
      const current = prev[category] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
    // 重置页码由 Hook 内部管理
  };

  const clearFilters = () => {
    umengclick('filter_click_type');
    setFilters({
      resolution: [],
      aspectRatio: [],
    });
  };

  const activeFilterCount = filters.resolution.length + filters.aspectRatio.length;

  const emptySignature = useMemo(
    () => `${query}|${JSON.stringify(filters)}|${filteredWallpapers.length}`,
    [query, filters, filteredWallpapers.length],
  );
  
  useSearchEmptyTrack(
    filteredWallpapers.length === 0,
    query.trim().length > 0 || activeFilterCount > 0,
    emptySignature,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <SearchBar
            onSearch={(q) => setQuery(q)}
            initialQuery={query}
            showFilters
            onFiltersClick={() => setShowFilters(!showFilters)}
          />
        </div>

      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.searchPage.filters}</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {t.searchPage.clearAll}
                  </button>
                )}
              </div>

              {/* Resolution */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.resolution}</h4>
                <div className="flex flex-wrap gap-2">
                  {resolutionOptions.map((res) => (
                    <button
                      key={res}
                      onClick={() => toggleFilter('resolution', res)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.resolution.includes(res)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.aspectRatio}</h4>
                <div className="flex flex-wrap gap-2">
                  {aspectRatioOptions.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => toggleFilter('aspectRatio', ratio)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.aspectRatio.includes(ratio)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purity - 暂时注释掉 */}
              {/* <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.contentRating}</h4>
                <div className="flex flex-wrap gap-2">
                  {purityOptions.map((purity) => (
                    <button
                      key={purity}
                      onClick={() => toggleFilter('purity', purity)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.purity.includes(purity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.purity[purity]}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {filters.resolution.map((res) => (
              <FilterChip
                key={res}
                label={res}
                onRemove={() => toggleFilter('resolution', res)}
              />
            ))}
            {filters.aspectRatio.map((ratio) => (
              <FilterChip
                key={ratio}
                label={ratio}
                onRemove={() => toggleFilter('aspectRatio', ratio)}
              />
            ))}
            {/* {filters.purity.filter(p => p !== 'SFW').map((purity) => (
              <FilterChip
                key={purity}
                label={t.purity[purity]}
                onRemove={() => toggleFilter('purity', purity)}
              />
            ))} */}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="py-4">
        {loading && filteredWallpapers.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 px-4">
             <p className="text-gray-500">{t.common.loading}</p>
           </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-16 px-4">
             <p className="text-red-500">{t.common.loadFailed}</p>
           </div>
        ) : filteredWallpapers.length > 0 ? (
          <>
            <WallpaperGrid wallpapers={filteredWallpapers} />
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button 
                  onClick={loadMore}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                   {t.common.loadMore}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-2">{t.searchPage.noWallpapersFound}</p>
            <p className="text-sm text-gray-400 text-center">{t.searchPage.tryAdjusting}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
    >
      {label}
      <X size={14} />
    </button>
  );
}