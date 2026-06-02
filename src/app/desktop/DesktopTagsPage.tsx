import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { Search, TrendingUp, Hash, Grid3x3, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationTags } from '../hooks/useNavigationTags';
import { getTagDisplayName } from '../utils/tagDisplay';
import { Helmet } from 'react-helmet-async';
import { getSeoTdk } from '../../api/wallpaper';

const TRENDING_DISPLAY = 8;

export default function DesktopTagsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allTagsLoading, setAllTagsLoading] = useState(false);
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);

  // 获取标签页面SEO数据，使用当前页面URL
  useEffect(() => {
    const currentUrl = `${window.location.origin}${window.location.pathname}`;
    console.log(' [DesktopTagsPage] 请求标签页面SEO数据, URL:', currentUrl);
    
    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [DesktopTagsPage] 标签页面SEO数据返回:', response);
        const seoItem = response.data?.results?.[0]; // 根据API响应结构调整
        if (seoItem) {
          setSeoData({
            title: seoItem.title,
            description: seoItem.description,
            keywords: seoItem.keywords,
          });
        } else {
          // 如果API没有返回数据，使用默认值
          setSeoData({
            title: 'Tags - HD Wallpaper Downloads',
            description: 'Browse all wallpaper tags, discover amazing collections of HD wallpapers',
            keywords: 'wallpaper tags, hd wallpaper, desktop wallpaper, photo tags'
          });
        }
      })
      .catch((err) => {
        console.error(' [DesktopTagsPage] 获取标签页面SEO数据失败:', err);
        // 出错时使用默认值
        setSeoData({
          title: 'Tags - HD Wallpaper Downloads',
          description: 'Browse all wallpaper tags, discover amazing collections of HD wallpapers',
          keywords: 'wallpaper tags, hd wallpaper, desktop wallpaper, photo tags'
        });
      });
  }, []);

  const {
    tags: hotTags,
    loading: hotLoading,
    error: hotError,
  } = useNavigationTags({
    isHot: true,
  });

  const {
    tags: allTags,
    loading: allLoading,
    error: allError,
  } = useNavigationTags({
    isHot: false,
  });

  const popularTags = useMemo(() => {
    // 如果有搜索关键词，则对热门标签也进行过滤
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      return hotTags
        .filter((tag) => {
          const label = getTagDisplayName(tag).toLowerCase();
          const slug = tag.name.toLowerCase();
          return label.includes(q) || slug.includes(q);
        })
        .slice(0, TRENDING_DISPLAY);
    }
    // 否则显示原始的前N个热门标签
    return hotTags.slice(0, TRENDING_DISPLAY);
  }, [hotTags, activeSearchQuery]);

  const filteredTags = useMemo(
    () =>
      allTags.filter((tag) => {
        const q = activeSearchQuery.toLowerCase();
        const label = getTagDisplayName(tag).toLowerCase();
        const slug = tag.name.toLowerCase();
        return label.includes(q) || slug.includes(q);
      }),
    [allTags, activeSearchQuery]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setActiveSearchQuery(searchQuery);
      setIsSearching(true);
      // All Tags 区域显示loading，2秒后关闭
      setAllTagsLoading(true);
      setTimeout(() => {
        setAllTagsLoading(false);
        setIsSearching(false);
      }, 1000);
    }
  };

  return (
    <>
      <Helmet>
        {/* Use SEO data from API */}
        <title>{seoData?.title || 'Tags - HD Wallpaper Downloads'}</title>
        <meta
          name="description"
          content={seoData?.description || 'Browse all wallpaper tags, discover amazing collections of HD wallpapers'}
        />
        <meta name="keywords" content={seoData?.keywords || 'wallpaper tags, hd wallpaper, desktop wallpaper, photo tags'} />
        <meta property="og:title" content={seoData?.title || 'Tags - HD Wallpaper Collection'} />
        <meta property="og:description" content={seoData?.description || 'Discover amazing collections of HD wallpapers organized by tags'} />
        <link rel="canonical" href={`${window.location.origin}/markwallpapers/tags`} />
      </Helmet>
      <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.tags.browseTags}</h1>
              <div className="max-w-2xl relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t.tags.searchTags}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Popular Tags */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t.tags.trendingTags}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hotLoading && (
                  <p className="text-sm text-gray-500 col-span-2 py-8 text-center">{t.common.loading}</p>
                )}
                {hotError && !hotLoading && (
                  <p className="text-sm text-red-500 col-span-2 py-8 text-center">{t.common.loadFailed}</p>
                )}
                {!hotLoading && !hotError && popularTags.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 col-span-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <SlidersHorizontal size={40} className="text-gray-400" />
                    </div>
                    <p className="text-base">{t.common.noResults}</p>
                  </div>
                )}
                {popularTags.map((tag, index) => (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tag/${encodeURIComponent(tag.tag || tag.name)}`}
                      onClick={() => umengclick('filter_click_tag')}
                      state={{
                        tagMeta: {
                          name: getTagDisplayName(tag) || tag.name,
                          wallpaperCount: tag.wallpaperCount,
                          description: tag.description,
                        },
                      }}
                      className="flex items-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-gray-100"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Hash size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            #{getTagDisplayName(tag) || tag.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{t.tags.wallpapers}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-xl font-bold text-blue-600">
                          {formatNumber(tag.wallpaperCount)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* All Tags */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Grid3x3 size={24} className="text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">{t.tags.allTags}</h2>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {(allLoading || allTagsLoading) && (
                    <p className="text-sm text-gray-500 w-full py-8 text-center">{t.common.loading}</p>
                  )}
                  {allError && !allLoading && !allTagsLoading && (
                    <p className="text-sm text-red-500 w-full py-8 text-center">{t.common.loadFailed}</p>
                  )}
                  {!allLoading && !allTagsLoading && !allError && filteredTags.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 w-full">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <SlidersHorizontal size={40} className="text-gray-400" />
                      </div>
                      <p className="text-base">{t.common.noResults}</p>
                    </div>
                  )}
                  {!allTagsLoading && filteredTags.map((tag) => (
                    <Link
                      key={tag.tag}
                      to={`/tag/${encodeURIComponent(tag.tag || tag.name)}`}
                      onClick={() => umengclick('filter_click_tag')}
                      state={{
                        tagMeta: {
                          name: getTagDisplayName(tag) || tag.name,
                          wallpaperCount: tag.wallpaperCount,
                          description: tag.description,
                        },
                      }}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                    >
                      <span className="font-medium">#{getTagDisplayName(tag) || tag.name}</span>
                      <span className="ml-2 text-gray-400 group-hover:text-blue-400">
                        ({formatNumber(tag.wallpaperCount)})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
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
