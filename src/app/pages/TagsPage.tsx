import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { Search, TrendingUp, Hash, SlidersHorizontal } from 'lucide-react';
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
    setIsSearching(true);
    // All Tags 区域显示loading，2秒后关闭
    setAllTagsLoading(true);
    setTimeout(() => {
      setAllTagsLoading(false);
      setIsSearching(false);
    },1000);
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
        <link rel="canonical" href={`${window.location.origin}/tags`} />
      </Helmet>
      <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 safe-area-pt">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground mb-3">{t.tags.browseTags}</h1>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 items-stretch w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.tags.searchTags}
                className="w-full pl-12 pr-[4.5rem] py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
              {isSearching ? (
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {t.nav.search}
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Popular Tags */}
      <section className="bg-card py-4 mb-4">
        <div className="px-4 mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-foreground">{t.tags.trendingTags}</h2>
        </div>
        <div className="px-4 space-y-2">
          {hotLoading && (
            <p className="text-sm text-muted-foreground py-4 text-center">{t.common.loading}</p>
          )}
          {hotError && !hotLoading && (
            <p className="text-sm text-red-500 py-4 text-center">{t.common.loadFailed}</p>
          )}
          {!hotLoading && !hotError && popularTags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <SlidersHorizontal size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm">{t.common.noResults}</p>
            </div>
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
                className="flex items-center justify-between p-4 bg-card rounded-xl hover:shadow-md transition-shadow border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shadow-sm">
                    <Hash size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      #{getTagDisplayName(tag) || tag.name}
                    </h3>
                    {tag.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{tag.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatNumber(tag.wallpaperCount)}</p>
                  <p className="text-xs text-muted-foreground">{t.tags.wallpapers}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Tags */}
      <section className="py-4">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-semibold text-foreground">{t.tags.allTags}</h2>
        </div>
        <div className="px-4 flex flex-wrap gap-2">
          {(allLoading || allTagsLoading) && (
            <p className="text-sm text-muted-foreground w-full py-4 text-center">{t.common.loading}</p>
          )}
          {allError && !allLoading && !allTagsLoading && (
            <p className="text-sm text-red-500 w-full py-4 text-center">{t.common.loadFailed}</p>
          )}
          {!allLoading && !allTagsLoading && !allError && filteredTags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground w-full">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <SlidersHorizontal size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm">{t.common.noResults}</p>
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
              className="px-4 py-2 bg-card border border-border hover:border-blue-600 hover:bg-blue-50 rounded-full text-sm text-foreground hover:text-blue-600 transition-all"
            >
              <span className="font-medium">#{getTagDisplayName(tag) || tag.name}</span>
              <span className="ml-2 text-muted-foreground">({formatNumber(tag.wallpaperCount)})</span>
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