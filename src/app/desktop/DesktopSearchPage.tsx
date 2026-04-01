import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { SearchBar } from '../components/SearchBar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { mockWallpapers } from '../mockData';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Filters {
  resolution: string[];
  aspectRatio: string[];
  purity: ('SFW' | 'Sketchy' | 'NSFW')[];
}

export default function DesktopSearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    resolution: [],
    aspectRatio: [],
    purity: ['SFW']
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filteredWallpapers = mockWallpapers.filter((wallpaper) => {
    const matchesQuery =
      !query ||
      wallpaper.title.toLowerCase().includes(query.toLowerCase()) ||
      wallpaper.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    const matchesResolution =
      filters.resolution.length === 0 || filters.resolution.includes(wallpaper.resolution);

    const matchesAspectRatio =
      filters.aspectRatio.length === 0 || filters.aspectRatio.includes(wallpaper.aspectRatio);

    const matchesPurity = filters.purity.length === 0 || filters.purity.includes(wallpaper.purity);

    return matchesQuery && matchesResolution && matchesAspectRatio && matchesPurity;
  });

  const resolutionOptions = ['3840x2160', '2560x1440', '1920x1080'];
  const aspectRatioOptions = ['16:9', '21:9', '9:16'];
  const purityOptions: ('SFW' | 'Sketchy' | 'NSFW')[] = ['SFW', 'Sketchy', 'NSFW'];

  const toggleFilter = <K extends keyof Filters>(category: K, value: Filters[K][number]) => {
    setFilters((prev) => {
      const current = prev[category] as any[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      resolution: [],
      aspectRatio: [],
      purity: ['SFW']
    });
  };

  const activeFilterCount =
    filters.resolution.length +
    filters.aspectRatio.length +
    (filters.purity.length > 1 ? filters.purity.length - 1 : 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Search Wallpapers</h1>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <SlidersHorizontal size={20} />
                  <span className="font-medium">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="max-w-2xl">
                <SearchBar onSearch={(q) => setQuery(q)} initialQuery={query} />
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <AnimatePresence>
                {showFilters && (
                  <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex-shrink-0 overflow-hidden"
                  >
                    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Filters</h3>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Resolution */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Resolution</h4>
                        <div className="space-y-2">
                          {resolutionOptions.map((res) => (
                            <button
                              key={res}
                              onClick={() => toggleFilter('resolution', res)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                filters.resolution.includes(res)
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {res}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Aspect Ratio */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Aspect Ratio</h4>
                        <div className="space-y-2">
                          {aspectRatioOptions.map((ratio) => (
                            <button
                              key={ratio}
                              onClick={() => toggleFilter('aspectRatio', ratio)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                filters.aspectRatio.includes(ratio)
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Purity */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Content Rating
                        </h4>
                        <div className="space-y-2">
                          {purityOptions.map((purity) => (
                            <button
                              key={purity}
                              onClick={() => toggleFilter('purity', purity)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                filters.purity.includes(purity)
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {purity}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Results */}
              <div className="flex-1">
                {/* Active Filter Tags */}
                {activeFilterCount > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {filters.resolution.map((res) => (
                      <FilterChip
                        key={res}
                        label={res}
                        onRemove={() => toggleFilter('resolution', res)}
                      />
                    ))}
                    {filters.aspectRatio.map((ratio) => (
                      <FilterChip
                        key={ratio}
                        label={ratio}
                        onRemove={() => toggleFilter('aspectRatio', ratio)}
                      />
                    ))}
                    {filters.purity
                      .filter((p) => p !== 'SFW')
                      .map((purity) => (
                        <FilterChip
                          key={purity}
                          label={purity}
                          onRemove={() => toggleFilter('purity', purity)}
                        />
                      ))}
                  </div>
                )}

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filteredWallpapers.length}
                    </span>{' '}
                    wallpaper{filteredWallpapers.length !== 1 ? 's' : ''} found
                    {query && (
                      <>
                        {' '}
                        for <span className="font-semibold text-gray-900">"{query}"</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Grid */}
                {filteredWallpapers.length > 0 ? (
                  <DesktopWallpaperGrid wallpapers={filteredWallpapers} columns={showFilters ? 3 : 4} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <SlidersHorizontal size={40} className="text-gray-400" />
                    </div>
                    <p className="text-xl text-gray-500 mb-2">No wallpapers found</p>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
    >
      {label}
      <X size={14} />
    </button>
  );
}