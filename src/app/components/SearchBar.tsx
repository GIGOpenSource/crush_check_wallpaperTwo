import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { umengclick } from '../analytics/aplusTracking';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  showFilters?: boolean;
  onFiltersClick?: () => void;
  /** 默认 true：输入防抖上报 search_input */
  trackSearchInput?: boolean;
  /** 默认 true：提交时上报 search_click */
  trackSearchClick?: boolean;
}

export function SearchBar({
  onSearch,
  initialQuery = '',
  showFilters,
  onFiltersClick,
  trackSearchInput = true,
  trackSearchClick = true,
}: SearchBarProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const inputDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackSearchClick) umengclick('search_click');
    if (onSearch) {
      onSearch(query);
    } else if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (!trackSearchInput) return;
    if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    inputDebounceRef.current = setTimeout(() => {
      if (v.trim()) umengclick('search_input');
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-stretch w-full">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={t.searchPage.searchPlaceholder}
          className="w-full pl-12 pr-[4.5rem] py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {t.nav.search}
        </button>
      </div>
      {showFilters && onFiltersClick ? (
        <button
          type="button"
          onClick={onFiltersClick}
          className="shrink-0 px-3 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 border border-gray-200"
          aria-label={t.searchPage.filters}
        >
          <SlidersHorizontal size={20} />
        </button>
      ) : null}
    </form>
  );
}
