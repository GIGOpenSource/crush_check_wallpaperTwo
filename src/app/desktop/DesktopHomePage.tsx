import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { SearchBar } from '../components/SearchBar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { EditorsPickWallpaperLink } from '../components/EditorsPickWallpaperLink';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { editorsPicks } from '../mockData';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber } from '../utils/format';
import { useHomePopularWallpapers } from '../hooks/useHomePopularWallpapers';

export default function DesktopHomePage() {
  const { t } = useLanguage();
  const {
    wallpapers: popularWallpapers,
    loading: popularLoading,
    loadingMore: popularLoadingMore,
    error: popularError,
    hasMore: popularHasMore,
    sentinelRef: popularSentinelRef,
  } = useHomePopularWallpapers();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % editorsPicks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentSlide * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + editorsPicks.length) % editorsPicks.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % editorsPicks.length);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t.home.discoverWallpapers}</h2>
              </div>
              <div className="max-w-2xl">
                <SearchBar />
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Editor's Picks Carousel */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={24} className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">{t.home.editorsPicks}</h2>
              </div>

              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {editorsPicks.map((wallpaper) => (
                    <EditorsPickWallpaperLink
                      key={wallpaper.id}
                      wallpaper={wallpaper}
                      className="flex-shrink-0 w-full snap-center"
                    >
                      <div className="relative aspect-[21/9] overflow-hidden">
                        <img
                          src={wallpaper.imageUrl}
                          alt={wallpaper.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="max-w-3xl">
                              <h3 className="text-white text-3xl font-bold mb-3">
                                {wallpaper.title}
                              </h3>
                              <p className="text-white/90 text-lg mb-4">
                                {t.home.by} {wallpaper.uploader.username}
                              </p>
                              <div className="flex items-center gap-4 text-white/80">
                                <span>{wallpaper.resolution}</span>
                                <span>•</span>
                                <span>{formatNumber(wallpaper.views)} {t.wallpaperDetail.views.toLowerCase()}</span>
                                <span>•</span>
                                <span>{formatNumber(wallpaper.downloads)} {t.wallpaperDetail.downloads.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </EditorsPickWallpaperLink>
                  ))}
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors"
                >
                  <ChevronLeft size={28} className="text-gray-900" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors"
                >
                  <ChevronRight size={28} className="text-gray-900" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {editorsPicks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className="relative"
                    >
                      <div
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? 'bg-white w-8'
                            : 'bg-white/50 w-2 hover:bg-white/70'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Popular Wallpapers */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.home.popularWallpapers}</h2>
                <Link
                  to="/search"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {t.common.viewAll}
                  <ChevronRight size={20} />
                </Link>
              </div>
              {popularLoading ? (
                <p className="py-12 text-center text-gray-500">{t.common.loading}</p>
              ) : popularError || popularWallpapers.length === 0 ? (
                <p className="py-12 text-center text-gray-500">{t.searchPage.noWallpapersFound}</p>
              ) : (
                <>
                  <DesktopWallpaperGrid
                    wallpapers={popularWallpapers}
                    columns={4}
                    listNavBase={{ platform: 'PC', media_live: false }}
                  />
                  {popularHasMore ? (
                    <div ref={popularSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
                  ) : null}
                  {popularLoadingMore ? (
                    <p className="py-6 text-center text-sm text-gray-400">{t.common.loading}</p>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}