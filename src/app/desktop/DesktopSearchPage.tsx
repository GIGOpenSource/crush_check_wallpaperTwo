import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { SearchBar } from '../components/SearchBar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { tpl } from '../utils/format';
import { useSearchWallpapers, SearchFilters } from '../hooks/useSearchWallpapers';
import { useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { getSeoTdk } from '../../api/wallpaper';

interface Filters {
  resolution: string[];
  aspectRatio: string[];
}

export default function DesktopSearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const columns = 3;
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    resolution: [],
    aspectRatio: [],
  });
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Fetch SEO data
  useEffect(() => {
    // Construct the full URL of the current page
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    
    console.log('🔍 [DesktopSearchPage] Requesting SEO data:', currentUrl);

    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [DesktopSearchPage] SEO data returned:', response);
        // Get the first item from the results array
        const seoItem = response.data?.results?.[0];
        if (seoItem) {
          setSeoData({
            title: seoItem.title,
            description: seoItem.description,
            keywords: seoItem.keywords,
          });
        }
      })
      .catch((err) => {
        console.error('❌ [DesktopSearchPage] Failed to fetch SEO data:', err);
      });
  }, [query]);

  // Fetch wallpaper data using real API
  const {
    wallpapers: filteredWallpapers,
    loading,
    error,
    hasMore,
    loadMore,
    totalCount,
    currentPage,
  } = useSearchWallpapers(query, filters, 1, 24, 'PC');

  // 无限滚动：使用 IntersectionObserver 检测底部
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' } // 提前200px触发加载
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const activeFilterCount = filters.resolution.length + filters.aspectRatio.length;

  const emptySignature = useMemo(
    () => `${query}|${JSON.stringify(filters)}|${filteredWallpapers.length}`,
    [query, filters, filteredWallpapers.length],
  );
  
  // Note: useSearchEmptyTrack usage depends on its specific implementation requirements. 
  // Assuming it's still needed for tracking empty states.
  // If useSearchWallpapers handles tracking internally, this might be removable.
  // For now, keeping the structure similar but using hook data.
  /* 
  useSearchEmptyTrack(
    filteredWallpapers.length === 0,
    query.trim().length > 0 || activeFilterCount > 0,
    emptySignature,
  ); 
  */

  const handleClearFilters = () => {
    setFilters({
      resolution: [],
      aspectRatio: [],
    });
  };

  const handleToggleFilter = <K extends keyof typeof filters>(category: K, value: (typeof filters)[K][number]) => {
    setFilters((prev) => {
      const current = prev[category] as any[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  return (
    <>
      <Helmet>
        {/* Prioritize API-returned SEO data, fallback to default data */}
        <title>{seoData?.title || (query ? `${query} - Search Results` : 'Search Wallpapers')}</title>
        <meta 
          name="description" 
          content={seoData?.description || (query ? `Search for wallpapers related to "${query}"` : 'Search beautiful HD wallpapers')} 
        />
        <meta name="keywords" content={seoData?.keywords || 'wallpaper, search, HD wallpaper, desktop wallpaper'} />
        <meta property="og:title" content={seoData?.title || (query ? `${query} - Wallpaper Search` : 'Search Wallpapers')} />
        <meta property="og:description" content={seoData?.description || 'Discover beautiful HD wallpapers'} />
        <link rel="canonical" href={`${window.location.origin}/markwallpapers/search`} />
      </Helmet>
      <div className="flex h-screen overflow-hidden bg-background">
        <DesktopSidebar />

        <main className="flex-1 ml-64 overflow-y-auto">
          {/* Header */}
          <header className="bg-card border-b border-border sticky top-0 z-30">
            <div className="px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-foreground">{t.searchPage.searchWallpapers}</h1>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showFilters
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-muted text-gray-600 hover:bg-muted'
                    }`}
                  >
                    <SlidersHorizontal size={20} />
                    <span className="font-medium">{t.searchPage.filters}</span>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="max-w-2xl">
                  <SearchBar initialQuery={query} />
                </div>
              </div>
            </div>
          </header>

          <div className="px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-8">
                {/* Filters Sidebar - 使用sticky定位 */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex-shrink-0"
                    >
                      <div ref={filtersRef} className="bg-card rounded-xl p-6 shadow-sm sticky top-[180px] max-h-[calc(100vh-160px)] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-foreground">{t.searchPage.filters}</h3>
                          {activeFilterCount > 0 && (
                            <button
                              onClick={handleClearFilters}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {t.searchPage.clearAll}
                            </button>
                          )}
                        </div>

                        {/* Resolution */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            {t.searchPage.resolution}
                          </h4>
                          <div className="space-y-2">
                            {['3840x2160', '2560x1440', '1920x1080'].map((res) => (
                              <button
                                key={res}
                                onClick={() => handleToggleFilter('resolution', res)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  filters.resolution.includes(res)
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                {res}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            {t.searchPage.aspectRatio}
                          </h4>
                          <div className="space-y-2">
                            {['16:9', '21:9', '9:16'].map((ratio) => (
                              <button
                                key={ratio}
                                onClick={() => handleToggleFilter('aspectRatio', ratio)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  filters.aspectRatio.includes(ratio)
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Results - 右侧滚动区域 */}
                <div className="flex-1">
                  {/* Active Filter Tags */}
                  {activeFilterCount > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {filters.resolution.map((res) => (
                        <FilterChip
                          key={res}
                          label={res}
                          onRemove={() => handleToggleFilter('resolution', res)}
                        />
                      ))}
                      {filters.aspectRatio.map((ratio) => (
                        <FilterChip
                          key={ratio}
                          label={ratio}
                          onRemove={() => handleToggleFilter('aspectRatio', ratio)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Grid */}
                  {loading && filteredWallpapers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                      <p className="text-muted-foreground">{t.common.loading}</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                      <p className="text-red-500">{t.common.loadFailed}</p>
                    </div>
                  ) : filteredWallpapers.length > 0 ? (
                    <>
                      <DesktopWallpaperGrid wallpapers={filteredWallpapers} columns={columns} />
                      {/* 无限滚动触发器 */}
                      {hasMore && (
                        <div ref={sentinelRef} className="h-1 w-full shrink-0" aria-hidden />
                      )}
                      {/* 加载中提示 */}
                      {loading && (
                        <p className="py-6 text-center text-sm text-muted-foreground">{t.common.loading}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <SlidersHorizontal size={40} className="text-muted-foreground" />
                      </div>
                      <p className="text-xl text-muted-foreground mb-2">{t.searchPage.noWallpapersFound}</p>
                      <p className="text-muted-foreground">{t.searchPage.tryAdjusting}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
    >
      {label}
      <X size={14} />
    </button>
  );
}