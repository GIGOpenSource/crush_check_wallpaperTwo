import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { mockWallpapers, mockTags } from '../mockData';
import { ChevronLeft, SlidersHorizontal, Calendar, Eye, Download } from 'lucide-react';
import { motion } from 'motion/react';

type SortOption = 'relevance' | 'date' | 'views' | 'downloads';

export default function DesktopTagDetailPage() {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const tag = mockTags.find((t) => t.name === tagName);
  const tagWallpapers = mockWallpapers.filter((w) => w.tags.includes(tagName || ''));

  const sortedWallpapers = [...tagWallpapers].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'views':
        return b.views - a.views;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return 0;
    }
  });

  if (!tag) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Tag not found</p>
        </div>
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string; icon: any }[] = [
    { value: 'relevance', label: 'Relevance', icon: SlidersHorizontal },
    { value: 'date', label: 'Latest', icon: Calendar },
    { value: 'views', label: 'Most Viewed', icon: Eye },
    { value: 'downloads', label: 'Most Downloaded', icon: Download }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">#{tag.name}</h1>
                  <p className="text-gray-600 mt-1">
                    {formatNumber(tag.wallpaperCount)} wallpapers
                  </p>
                </div>
              </div>

              {tag.description && (
                <p className="text-gray-600 mb-4">{tag.description}</p>
              )}

              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            {sortedWallpapers.length > 0 ? (
              <DesktopWallpaperGrid wallpapers={sortedWallpapers} columns={4} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal size={40} className="text-gray-400" />
                </div>
                <p className="text-xl text-gray-500 mb-2">No wallpapers found</p>
                <p className="text-gray-400">No wallpapers with this tag yet</p>
              </div>
            )}
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
