import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import type { Tag } from '../types';
import type { TagDetailLocationState } from '../types/tagDetailNav';
import { ChevronLeft, SlidersHorizontal, Calendar, Eye, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTagWallpapersList } from '../hooks/useTagWallpapersList';
import { Helmet } from 'react-helmet-async';
import { getSeoTdk } from '../../api/wallpaper';

type SortOption = 'relevance' | 'latest' | 'views' | 'downloads';

export default function DesktopTagDetailPage() {
  const { t } = useLanguage();
  const { tagId: tagIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);

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

  // 获取SEO数据
  useEffect(() => {
    if (!decodedId) return;

    // 构建当前页面的完整URL
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;

    console.log('🔍 [DesktopTagDetailPage] 请求SEO数据:', currentUrl);

    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [DesktopTagDetailPage] SEO数据返回:', response);
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
        console.error('❌ [DesktopTagDetailPage] 获取SEO数据失败:', err);
      });
  }, [decodedId]);

  if (!displayTag) {
    return (
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-muted-foreground">{t.tags.tagNotFound}</p>
        </div>
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
    <>
      <Helmet>
        {/* 优先使用API返回的SEO数据，如果没有则使用默认数据 */}
        <title>{seoData?.title || (displayTag?.name ? `${displayTag.name} - tags` : 'Loading...')}</title>
        <meta
          name="description"
          content={seoData?.description || displayTag?.description || `View wallpapers under the "${displayTag?.name || ''}" tag, ${formatNumber(displayTag?.wallpaperCount || 0)} total wallpapers`}
/>
        <meta name="keywords" content={seoData?.keywords || `${displayTag?.name || ''}, tag, wallpaper, HD wallpaper`} />
        <meta property="og:title" content={seoData?.title || `${displayTag?.name || ''} - Wallpaper Tag`} />
        <meta property="og:description" content={seoData?.description || displayTag?.description || `Discover beautiful wallpapers for the "${displayTag?.name || ''}" tag`} />
        <link rel="canonical" href={`${window.location.origin}/markwallpapers/tag/${encodeURIComponent(displayTag?.name || '')}`} />
      </Helmet>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />

        <main className="flex-1 ml-64">
          <header className="bg-card border-b border-border sticky top-0 z-30">
            <div className="px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} className="text-foreground" />
                  </button>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">#{displayTag.name}</h1>
                    <p className="text-gray-600 mt-1">
                      {formatNumber(displayTag.wallpaperCount)} {t.tags.wallpapers}
                    </p>
                  </div>
                </div>

                {displayTag.description && (
                  <p className="text-gray-600 mb-4">{displayTag.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{t.tags.sortBy}</span>
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${sortBy === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted text-foreground hover:bg-muted'
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
                <p className="text-center text-muted-foreground py-20">{t.common.loading}</p>
              )}
              {error && wallpapers.length === 0 && !loading && (
                <p className="text-center text-red-500 py-20">{t.common.loadFailed}</p>
              )}
              {!loading && !error && wallpapers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <SlidersHorizontal size={40} className="text-muted-foreground" />
                  </div>
                  <p className="text-xl text-muted-foreground mb-2">{t.searchPage.noWallpapersFound}</p>
                  <p className="text-muted-foreground">{t.tags.noWallpapersWithTag}</p>
                </div>
              )}
              {wallpapers.length > 0 && (
                <>
                  <DesktopWallpaperGrid
                    wallpapers={wallpapers}
                    columns={4}
                    listNavBase={listNavBase}
                  />
                  {loadingMore && (
                    <p className="text-center text-sm text-muted-foreground py-6">{t.common.loading}</p>
                  )}
                  <div ref={sentinelRef} className="h-10" aria-hidden />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
