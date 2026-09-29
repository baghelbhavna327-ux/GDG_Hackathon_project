import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Loader2,
  Building2,
  Pill,
  AlertTriangle,
  ArrowRightLeft,
  Compass,
  Package,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { SearchResultItem, SearchResultType } from '../../types/search';
import { searchService } from '../../services/searchService';

interface GlobalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search PHCs, medicines, inventory, alerts...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  // Load recent searches on initial mount
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());
  }, []);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search with cancellation
  const executeSearch = useCallback((searchTerm: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const items = await searchService.search(trimmed, abortControllerRef.current.signal);
        setResults(items);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 220); // 220ms responsive debounce
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    setIsOpen(true);
    executeSearch(newVal);
  };

  const handleSelectResult = (item: SearchResultItem) => {
    searchService.saveRecentSearch(value.trim() || item.title);
    setRecentSearches(searchService.getRecentSearches());
    setIsOpen(false);
    navigate(item.route);
  };

  const handleSelectRecent = (term: string) => {
    onChange(term);
    executeSearch(term);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setResults([]);
    setSelectedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Keyboard navigation: Up, Down, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectResult(results[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Icon mapping helper
  const getCategoryIcon = (type: SearchResultType) => {
    switch (type) {
      case 'PAGE':
        return <Compass className="h-4 w-4 text-teal-600" />;
      case 'PHC':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'MEDICINE':
        return <Pill className="h-4 w-4 text-emerald-600" />;
      case 'INVENTORY':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'ALERT':
        return <AlertOctagon className="h-4 w-4 text-rose-600" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="h-4 w-4 text-cyan-600" />;
      default:
        return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  // Highlight matched substring
  const highlightMatch = (text: string, query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return text;

    const regex = new RegExp(`(${trimmedQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-teal-100 text-teal-900 font-extrabold rounded-sm px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input Box */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-1.5 pl-9 pr-8 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 transition shadow-inner"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Right Action: Loading Spinner or Clear Button */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 animate-spin" />
          ) : value.trim() ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] flex flex-col text-slate-900 dark:text-slate-100">
          {/* 1. Results List */}
          {results.length > 0 ? (
            <div className="overflow-y-auto p-1.5 divide-y divide-slate-50 dark:divide-slate-800 space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Records ({results.length})</span>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">↑↓ to navigate • Enter to open</span>
              </div>

              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition group ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 shadow-sm'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs shrink-0">
                        {getCategoryIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {highlightMatch(item.title, value)}
                          </p>
                          {item.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'text-teal-600 dark:text-teal-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : value.trim() && !isLoading ? (
            /* 2. No Results State */
            <div className="p-6 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                No matching records found for "{value}"
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Try searching for a facility (e.g. <span className="font-semibold text-teal-700 dark:text-teal-400">Sehore</span>, <span className="font-semibold text-teal-700 dark:text-teal-400">Bhopal</span>), medicine (<span className="font-semibold text-teal-700 dark:text-teal-400">Paracetamol</span>), or module (<span className="font-semibold text-teal-700 dark:text-teal-400">Emergency</span>).
              </p>
            </div>
          ) : !value.trim() && recentSearches.length > 0 ? (
            /* 3. Recent Searches State */
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                  Recent Searches
                </span>
                <button
                  onClick={() => {
                    searchService.clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold"
                >
                  Clear All
                </button>
              </div>

              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectRecent(term)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition text-left"
                >
                  <span className="truncate">{term}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                </button>
              ))}
            </div>
          ) : (
            /* 4. Quick Suggestions Initial State */
            <div className="p-3 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Quick Shortcuts
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSelectRecent('Paracetamol')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-800 dark:hover:text-teal-300 text-slate-700 dark:text-slate-200 font-medium text-left transition flex items-center gap-2 border border-slate-100 dark:border-slate-700/60"
                >
                  <Pill className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">Paracetamol</span>
                </button>
                <button
                  onClick={() => handleSelectRecent('Sehore')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-800 dark:hover:text-blue-300 text-slate-700 dark:text-slate-200 font-medium text-left transition flex items-center gap-2 border border-slate-100 dark:border-slate-700/60"
                >
                  <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">PHC Sehore</span>
                </button>
                <button
                  onClick={() => handleSelectRecent('Emergency')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-800 dark:hover:text-rose-300 text-slate-700 dark:text-slate-200 font-medium text-left transition flex items-center gap-2 border border-slate-100 dark:border-slate-700/60"
                >
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="truncate">Emergency Surge</span>
                </button>
                <button
                  onClick={() => handleSelectRecent('Federated AI')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-800 dark:hover:text-purple-300 text-slate-700 dark:text-slate-200 font-medium text-left transition flex items-center gap-2 border border-slate-100 dark:border-slate-700/60"
                >
                  <Compass className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Federated AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
