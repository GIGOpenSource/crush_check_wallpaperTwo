import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { SearchBar } from '../components/SearchBar';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { mockWallpapers, mockTags } from '../mockData';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { tpl } from '../utils/format';
import { getTagDisplayName } from '../utils/tagDisplay';

interface Filters {
  resolution: string[];
  aspectRatio: string[];
  purity: ('SFW' | 'Sketchy' | 'NSFW')[];
}

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    resolution: [],
    aspectRatio: [],
    purity: ['SFW']
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Filter wallpapers based on search and filters
  const filteredWallpapers = mockWallpapers.filter((wallpaper) => {
    const matchesQuery =
      !query ||
      wallpaper.title.toLowerCase().includes(query.toLowerCase()) ||
      wallpaper.tags.some(
        (tag) =>
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.id.toLowerCase().includes(query.toLowerCase()),
      );

    const matchesResolution =
      filters.resolution.length === 0 || filters.resolution.includes(wallpaper.resolution);

    const matchesAspectRatio =
      filters.aspectRatio.length === 0 || filters.aspectRatio.includes(wallpaper.aspectRatio);

    const matchesPurity =
      filters.purity.length === 0 || filters.purity.includes(wallpaper.purity);

    return matchesQuery && matchesResolution && matchesAspectRatio && matchesPurity;
  });

  const suggestedTags = mockTags
    .filter((tag) => {
      const q = query.toLowerCase();
      return (
        getTagDisplayName(tag).toLowerCase().includes(q) || tag.name.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const resolutionOptions = ['3840x2160', '2560x1440', '1920x1080'];
  const aspectRatioOptions = ['16:9', '21:9', '9:16'];
  const purityOptions: ('SFW' | 'Sketchy' | 'NSFW')[] = ['SFW', 'Sketchy', 'NSFW'];

  const toggleFilter = <K extends keyof Filters>(
    category: K,
    value: Filters[K][number]
  ) => {
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
    filters.resolution.length + filters.aspectRatio.length + (filters.purity.length > 1 ? filters.purity.length - 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <SearchBar
            onSearch={(q) => setQuery(q)}
            initialQuery={query}
            showFilters
            onFiltersClick={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Suggested Tags */}
        {query && suggestedTags.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-500 mb-2">{t.upload.suggestedTags}</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() =>
                    navigate(`/tag/${encodeURIComponent(tag.tag)}`, {
                      state: {
                        tagMeta: {
                          name: getTagDisplayName(tag) || tag.name,
                          wallpaperCount: tag.wallpaperCount,
                          description: tag.description,
                        },
                      },
                    })
                  }
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full hover:bg-blue-100"
                >
                  #{getTagDisplayName(tag) || tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.searchPage.filters}</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {t.searchPage.clearAll}
                  </button>
                )}
              </div>

              {/* Resolution */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.resolution}</h4>
                <div className="flex flex-wrap gap-2">
                  {resolutionOptions.map((res) => (
                    <button
                      key={res}
                      onClick={() => toggleFilter('resolution', res)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.resolution.includes(res)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.aspectRatio}</h4>
                <div className="flex flex-wrap gap-2">
                  {aspectRatioOptions.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => toggleFilter('aspectRatio', ratio)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.aspectRatio.includes(ratio)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purity */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">{t.searchPage.contentRating}</h4>
                <div className="flex flex-wrap gap-2">
                  {purityOptions.map((purity) => (
                    <button
                      key={purity}
                      onClick={() => toggleFilter('purity', purity)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.purity.includes(purity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.purity[purity]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-wrap gap-2">
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
            {filters.purity.filter(p => p !== 'SFW').map((purity) => (
              <FilterChip
                key={purity}
                label={t.purity[purity]}
                onRemove={() => toggleFilter('purity', purity)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="py-4">
        <div className="px-4 mb-4">
          <p className="text-sm text-gray-600">
            {tpl(
              filteredWallpapers.length === 1
                ? t.searchPage.wallpapersFoundOne
                : t.searchPage.wallpapersFoundMany,
              { count: filteredWallpapers.length },
            )}
            {query ? tpl(t.searchPage.resultsForQuery, { q: query }) : ''}
          </p>
        </div>
        {filteredWallpapers.length > 0 ? (
          <WallpaperGrid wallpapers={filteredWallpapers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-2">{t.searchPage.noWallpapersFound}</p>
            <p className="text-sm text-gray-400 text-center">{t.searchPage.tryAdjusting}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
    >
      {label}
      <X size={14} />
    </button>
  );
}