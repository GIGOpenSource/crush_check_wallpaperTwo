import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { Search, TrendingUp, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationTags } from '../hooks/useNavigationTags';
import { getTagDisplayName } from '../utils/tagDisplay';
import { Helmet } from 'react-helmet-async';
import { getSeoTdk } from '../../api/wallpaper';

/** 热门区展示条数 */
const TRENDING_DISPLAY = 5;

export default function TagsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allTagsLoading, setAllTagsLoading] = useState(false);
  const [seoData, setSeoData] = useState<{ title?: string; description?: string; keywords?: string } | null>(null);

  // 获取标签页面SEO数据，使用当前页面URL
  useEffect(() => {
    const currentUrl = `${window.location.origin}${window.location.pathname}`;
    console.log(' [MobileTagsPage] 请求标签页面SEO数据, URL:', currentUrl);
    
    getSeoTdk(currentUrl)
      .then((response) => {
        console.log('✅ [MobileTagsPage] 标签页面SEO数据返回:', response);
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
        console.error(' [MobileTagsPage] 获取标签页面SEO数据失败:', err);
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

  const popularTags = useMemo(() => hotTags.slice(0, TRENDING_DISPLAY), [hotTags]);

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
      },1000);
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
      <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 mb-3">{t.tags.browseTags}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t.tags.searchTags}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-600"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Popular Tags */}
      <section className="bg-white py-4 mb-4">
        <div className="px-4 mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t.tags.trendingTags}</h2>
        </div>
        <div className="px-4 space-y-2">
          {hotLoading && (
            <p className="text-sm text-gray-500 py-4 text-center">{t.common.loading}</p>
          )}
          {hotError && !hotLoading && (
            <p className="text-sm text-red-500 py-4 text-center">{t.common.loadFailed}</p>
          )}
          {!hotLoading && !hotError && popularTags.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">{t.common.noResults}</p>
          )}
          {popularTags.map((tag, index) => (
            <motion.div
              key={tag.tag}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Hash size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      #{getTagDisplayName(tag) || tag.name}
                    </h3>
                    {tag.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{tag.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatNumber(tag.wallpaperCount)}</p>
                  <p className="text-xs text-gray-500">{t.tags.wallpapers}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Tags */}
      <section className="py-4">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">{t.tags.allTags}</h2>
        </div>
        <div className="px-4 flex flex-wrap gap-2">
          {(allLoading || allTagsLoading) && (
            <p className="text-sm text-gray-500 w-full py-4 text-center">{t.common.loading}</p>
          )}
          {allError && !allLoading && !allTagsLoading && (
            <p className="text-sm text-red-500 w-full py-4 text-center">{t.common.loadFailed}</p>
          )}
          {!allLoading && !allTagsLoading && !allError && filteredTags.length === 0 && (
            <p className="text-sm text-gray-500 w-full py-4 text-center">{t.common.noResults}</p>
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
              className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 rounded-full text-sm text-gray-700 hover:text-blue-600 transition-all"
            >
              <span className="font-medium">#{getTagDisplayName(tag) || tag.name}</span>
              <span className="ml-2 text-gray-400">({formatNumber(tag.wallpaperCount)})</span>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
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