import { useState } from 'react';
import { Link } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { mockTags } from '../mockData';
import { Search, TrendingUp, Hash, Grid3x3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function DesktopTagsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = mockTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTags = [...mockTags].sort((a, b) => b.wallpaperCount - a.wallpaperCount).slice(0, 8);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Browse Tags</h1>
              <div className="max-w-2xl relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags..."
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
                <h2 className="text-2xl font-bold text-gray-900">Trending Tags</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {popularTags.map((tag, index) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tag/${tag.name}`}
                      className="flex items-center justify-between p-6 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Hash size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">#{tag.name}</h3>
                          {tag.description && (
                            <p className="text-sm text-gray-500 mt-1">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatNumber(tag.wallpaperCount)}
                        </p>
                        <p className="text-sm text-gray-500">wallpapers</p>
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
                <h2 className="text-2xl font-bold text-gray-900">All Tags</h2>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {filteredTags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tag/${tag.name}`}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                    >
                      <span className="font-medium">#{tag.name}</span>
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
