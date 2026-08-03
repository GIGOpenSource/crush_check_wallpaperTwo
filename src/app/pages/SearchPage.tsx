import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { SearchBar } from '../components/SearchBar';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { PullToRefresh } from '../components/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useSearchEmptyTrack } from '../hooks/useSearchEmptyTrack';
import { useLanguage } from '../contexts/LanguageContext';
import { tpl } from '../utils/format';
import { getTagDisplayName } from '../utils/tagDisplay';
import { useSearchWallpapers, SearchFilters } from '../hooks/useSearchWallpapers';
import { Helmet } from 'react-helmet-async';
import { getSeoTdk } from '../../api/wallpaper';

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    resolution: [],
    aspectRatio: [],
  });
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // 获取SEO数据
  useEffect(() => {
    // 构建当前页面的完整URL
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    
    console.log('🔍 [SearchPage] 请求SEO数据:', currentUrl);

    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [SearchPage] SEO数据返回:', response);
        // 从 results 数组中获取第一条数据
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
        console.error('❌ [SearchPage] 获取SEO数据失败:', err);
      });
  }, [query]);

  // 使用真实 API 获取壁纸数据
  const {
    wallpapers: filteredWallpapers,
    loading,
    error,
    hasMore,
    loadMore,
    totalCount,
    currentPage,
    refresh: refreshSearch,
  } = useSearchWallpapers(query, filters, 1, 20, 'PHONE');

  // 下拉刷新
  const handleRefresh = async () => {
    return new Promise<void>((resolve) => {
      refreshSearch();
      setTimeout(resolve, 500);
    });
  };

  const { refreshing, pullDistance, isPulling, threshold } = usePullToRefresh(
    containerRef,
    handleRefresh,
    { threshold: 70, maxDistance: 120 }
  );

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
    <>
      <Helmet>
        {/* Prioritize API-returned SEO data, fallback to default data */}
        <title>{seoData?.title || (query ? `${query} - Search Results` : 'Search Wallpapers')}</title>
        <meta 
          name="description" 
          content={seoData?.description || (query ? `Search for wallpapers related to "${query}"` : 'Search beautiful HD wallpapers')} 
        />
        <meta name="keywords" content={seoData?.keywords || 'wallpaper, search, HD wallpaper, mobile wallpaper'} />
        <meta property="og:title" content={seoData?.title || (query ? `${query} - Wallpaper Search` : 'Search Wallpapers')} />
        <meta property="og:description" content={seoData?.description || 'Discover beautiful HD wallpapers'} />
        <link rel="canonical" href={`${window.location.origin}/search`} />
      </Helmet>
      <PullToRefresh
        pullDistance={pullDistance}
        threshold={threshold}
        refreshing={refreshing}
        isPulling={isPulling}
        className="max-w-md mx-auto"
      >
        <div ref={containerRef} className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 safe-area-pt">
        <div className="px-4 py-3">
          <SearchBar
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
            className="bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{t.searchPage.filters}</h3>
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
                <h4 className="text-xs font-medium text-foreground mb-2">{t.searchPage.resolution}</h4>
                <div className="flex flex-wrap gap-2">
                  {resolutionOptions.map((res) => (
                    <button
                      key={res}
                      onClick={() => toggleFilter('resolution', res)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.resolution.includes(res)
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground hover:bg-muted'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-foreground mb-2">{t.searchPage.aspectRatio}</h4>
                <div className="flex flex-wrap gap-2">
                  {aspectRatioOptions.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => toggleFilter('aspectRatio', ratio)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.aspectRatio.includes(ratio)
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground hover:bg-muted'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purity - 暂时注释掉 */}
              {/* <div>
                <h4 className="text-xs font-medium text-foreground mb-2">{t.searchPage.contentRating}</h4>
                <div className="flex flex-wrap gap-2">
                  {purityOptions.map((purity) => (
                    <button
                      key={purity}
                      onClick={() => toggleFilter('purity', purity)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.purity.includes(purity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground hover:bg-muted'
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
        <div className="bg-card border-b border-border px-4 py-2">
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
             <p className="text-muted-foreground">{t.common.loading}</p>
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
                  className="px-4 py-2 bg-card border border-gray-300 rounded-md text-sm text-foreground hover:bg-background"
                >
                   {t.common.loadMore}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center mb-2">{t.searchPage.noWallpapersFound}</p>
            <p className="text-sm text-muted-foreground text-center">{t.searchPage.tryAdjusting}</p>
          </div>
        )}
      </div>

        </div>
      </PullToRefresh>
      <BottomNav />
    </>
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