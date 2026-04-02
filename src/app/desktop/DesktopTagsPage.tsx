import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { Search, TrendingUp, Hash, Grid3x3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationTags } from '../hooks/useNavigationTags';
import { getTagDisplayName } from '../utils/tagDisplay';

const TRENDING_DISPLAY = 8;
const HOT_FETCH_PAGE_SIZE = 32;
const ALL_TAGS_PAGE_SIZE = 100;

export default function DesktopTagsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    tags: hotTags,
    loading: hotLoading,
    error: hotError,
  } = useNavigationTags({
    isHot: true,
    pageSize: HOT_FETCH_PAGE_SIZE,
    currentPage: 1,
  });

  const {
    tags: allTags,
    loading: allLoading,
    error: allError,
  } = useNavigationTags({
    isHot: false,
    pageSize: ALL_TAGS_PAGE_SIZE,
    currentPage: 1,
  });

  const popularTags = useMemo(() => hotTags.slice(0, TRENDING_DISPLAY), [hotTags]);

  const filteredTags = useMemo(
    () =>
      allTags.filter((tag) => {
        const q = searchQuery.toLowerCase();
        const label = getTagDisplayName(tag).toLowerCase();
        const slug = tag.name.toLowerCase();
        return label.includes(q) || slug.includes(q);
      }),
    [allTags, searchQuery]
  );

  return (
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
                  placeholder={t.tags.searchTags}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
                />
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
                  <p className="text-sm text-gray-500 col-span-2 py-8 text-center">{t.common.noResults}</p>
                )}
                {popularTags.map((tag, index) => (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tag/${encodeURIComponent(tag.tag)}`}
                      state={{
                        tagMeta: {
                          name: getTagDisplayName(tag) || tag.name,
                          wallpaperCount: tag.wallpaperCount,
                          description: tag.description,
                        },
                      }}
                      className="flex items-center justify-between p-6 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Hash size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            #{getTagDisplayName(tag) || tag.name}
                          </h3>
                          {tag.description && (
                            <p className="text-sm text-gray-500 mt-1">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatNumber(tag.wallpaperCount)}
                        </p>
                        <p className="text-sm text-gray-500">{t.tags.wallpapers}</p>
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
                  {allLoading && (
                    <p className="text-sm text-gray-500 w-full py-8 text-center">{t.common.loading}</p>
                  )}
                  {allError && !allLoading && (
                    <p className="text-sm text-red-500 w-full py-8 text-center">{t.common.loadFailed}</p>
                  )}
                  {!allLoading && !allError && filteredTags.length === 0 && (
                    <p className="text-sm text-gray-500 w-full py-8 text-center">{t.common.noResults}</p>
                  )}
                  {filteredTags.map((tag) => (
                    <Link
                      key={tag.tag}
                      to={`/tag/${encodeURIComponent(tag.tag)}`}
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
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
