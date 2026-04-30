import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { SearchBar } from '../components/SearchBar';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { EditorsPickWallpaperLink } from '../components/EditorsPickWallpaperLink';
import { BottomNav } from '../components/BottomNav';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useView } from '../contexts/ViewContext';
import { useHomePopularWallpapers } from '../hooks/useHomePopularWallpapers';
import { useHomeFeaturedWallpapers } from '../hooks/useHomeFeaturedWallpapers';
import { wallpaperListCoverUrl } from '../utils/wallpaperApiMap';
import { getSeoTdk } from '../../api/wallpaper';
import { formatNumber } from '../utils/format';

export default function HomePage() {
  const { t } = useLanguage();
  const location = useLocation();
  /** 与首页共用路由的「热门」页不展示编辑精选 Banner */
  const showEditorsBanner = location.pathname !== '/trending';
  const { viewMode } = useView();
  const popularListNavBase = {
    platform: (viewMode === 'mobile' ? 'PHONE' : 'PC') as 'PC' | 'PHONE',
    media_live: false,
  };
  const isTrendingRoute = location.pathname === '/trending';
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);

  // 获取SEO数据
  useEffect(() => {
    // 构建当前页面的完整URL
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    
    console.log('🔍 [HomePage] 请求SEO数据:', currentUrl);

    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [HomePage] SEO数据返回:', response);
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
        console.error('❌ [HomePage] 获取SEO数据失败:', err);
      });
  }, [isTrendingRoute]);

  const {
    wallpapers: popularWallpapers,
    loading: popularLoading,
    loadingMore: popularLoadingMore,
    error: popularError,
    hasMore: popularHasMore,
    sentinelRef: popularSentinelRef,
  } = useHomePopularWallpapers({ isHotRoute: isTrendingRoute });

  // 使用真实 API 获取精选壁纸
  const {
    wallpapers: featuredWallpapers,
    loading: featuredLoading,
    error: featuredError,
  } = useHomeFeaturedWallpapers();

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEditorsBanner || featuredWallpapers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredWallpapers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showEditorsBanner, featuredWallpapers.length]);

  useEffect(() => {
    if (!showEditorsBanner || !carouselRef.current || featuredWallpapers.length === 0) return;
    carouselRef.current.scrollTo({
      left: currentSlide * carouselRef.current.offsetWidth,
      behavior: 'smooth',
    });
  }, [currentSlide, showEditorsBanner, featuredWallpapers.length]);

  const handlePrev = () => {
    if (featuredWallpapers.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + featuredWallpapers.length) % featuredWallpapers.length);
  };

  const handleNext = () => {
    if (featuredWallpapers.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredWallpapers.length);
  };

  return (
    <>
      <Helmet>
        {/* 优先使用API返回的SEO数据，如果没有则使用默认数据 */}
        <title>{seoData?.title || (isTrendingRoute ? '热门壁纸 - 高清壁纸下载' : '首页 - 发现精美壁纸')}</title>
        <meta 
          name="description" 
          content={seoData?.description || (isTrendingRoute ? '浏览最受欢迎的热门高清壁纸，免费下载' : '发现精选的高清壁纸，个性化你的桌面')} 
        />
        <meta name="keywords" content={seoData?.keywords || (isTrendingRoute ? '热门壁纸, 流行壁纸, 高清壁纸' : '壁纸, 高清壁纸, 手机壁纸, 精选壁纸')} />
        <meta property="og:title" content={seoData?.title || (isTrendingRoute ? '热门壁纸' : '发现精美壁纸')} />
        <meta property="og:description" content={seoData?.description || '海量高清壁纸等你来发现'} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 mb-3">{t.home.title}</h1>
            <SearchBar />
          </div>
        </header>

        {showEditorsBanner ? (
          <section className="bg-white py-4 mb-6">
            <div className="px-4 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{t.home.editorsPicks}</h2>
            </div>

            {featuredLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">{t.common.loading}</div>
            ) : featuredError || featuredWallpapers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">{t.searchPage.noWallpapersFound}</div>
            ) : (
              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {featuredWallpapers.map((wallpaper) => (
                    <EditorsPickWallpaperLink
                      key={wallpaper.id}
                      wallpaper={wallpaper}
                      className="flex-shrink-0 w-full snap-center"
                    >
                      <div className="relative mx-4 aspect-[16/9] rounded-xl overflow-hidden">
                        <img
                           src={wallpaper.imageUrl}
                          alt={wallpaper.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-lg font-semibold mb-1">
                              {wallpaper.title}
                            </h3>
                            {wallpaper.description && (
                              <p className="text-white/80 text-sm mb-2 line-clamp-2">
                                {wallpaper.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <span>{wallpaper.resolution}</span>
                              <span>•</span>
                              <span>{formatNumber(wallpaper.views)} {t.wallpaperDetail.views.toLowerCase()}</span>
                              <span>•</span>
                              <span>{formatNumber(wallpaper.downloads)} {t.wallpaperDetail.downloads.toLowerCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </EditorsPickWallpaperLink>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight size={24} className="text-gray-900" />
                </button>

                <div className="flex items-center justify-center gap-2 mt-4">
                  {featuredWallpapers.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className="relative"
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide ? 'bg-blue-600 w-6' : 'bg-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* Popular Wallpapers */}
        <section className="py-4">
          <div className="px-4 mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isTrendingRoute ? t.home.hotWallpapers : t.home.popularWallpapers}
            </h2>
            <Link to="/search" className="text-sm text-blue-600 hover:text-blue-700">
              {t.common.viewAll}
            </Link>
          </div>
          {popularLoading ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">{t.common.loading}</p>
          ) : popularError || popularWallpapers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">{t.searchPage.noWallpapersFound}</p>
          ) : (
            <>
              <WallpaperGrid wallpapers={popularWallpapers} listNavBase={popularListNavBase} />
              {popularHasMore ? (
                <div ref={popularSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
              ) : null}
              {popularLoadingMore ? (
                <p className="px-4 py-4 text-center text-xs text-gray-400">{t.common.loading}</p>
              ) : null}
            </>
          )}
        </section>

        <BottomNav />
      </div>
    </>
  );
}