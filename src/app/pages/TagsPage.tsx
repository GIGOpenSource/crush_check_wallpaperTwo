import { useState } from 'react';
import { Link } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { mockTags } from '../mockData';
import { Search, TrendingUp, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function TagsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = mockTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTags = [...mockTags].sort((a, b) => b.wallpaperCount - a.wallpaperCount).slice(0, 5);

  return (
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
              placeholder={t.tags.searchTags}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-600"
            />
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
          {popularTags.map((tag, index) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/tag/${tag.name}`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Hash size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">#{tag.name}</h3>
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
          {filteredTags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.name}`}
              className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 rounded-full text-sm text-gray-700 hover:text-blue-600 transition-all"
            >
              <span className="font-medium">#{tag.name}</span>
              <span className="ml-2 text-gray-400">({formatNumber(tag.wallpaperCount)})</span>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}