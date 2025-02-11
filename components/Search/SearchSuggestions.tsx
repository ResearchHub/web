import { useEffect, useState } from 'react';
import { FileText, History, Search, X, Lightbulb, ArrowRight } from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/utils/styles';
import { SearchSuggestion } from '@/types/search';
interface SearchSuggestionsProps {
  query: string;
  isFocused?: boolean;
  onSelect?: (suggestion: SearchSuggestion) => void;
  displayMode?: 'dropdown' | 'inline';
  showSuggestionsOnFocus?: boolean;
}

const searchTips = [
  'Search by keyword or DOI',
  'Use quotes for exact matches',
  "Filter by author using 'author:'",
];

export function SearchSuggestions({
  query,
  isFocused = true,
  onSelect,
  displayMode = 'dropdown',
  showSuggestionsOnFocus = true,
}: SearchSuggestionsProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const { loading, suggestions, hasLocalSuggestions, clearSearchHistory } = useSearchSuggestions({
    query,
    includeLocalSuggestions: true,
  });

  // Rotate through tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % searchTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Only hide when explicitly not focused
  if (isFocused === false) {
    return null;
  }

  const renderSuggestion = (suggestion: SearchSuggestion) => {
    const isPaperSuggestion = suggestion.entityType === 'paper';
    const isUserSuggestion = suggestion.entityType === 'user' || suggestion.entityType === 'author';

    if (displayMode === 'inline') {
      return (
        <li key={isPaperSuggestion ? suggestion.id : suggestion.id}>
          <button
            type="button"
            className="w-full p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:translate-x-1 transition-all duration-200 flex items-start gap-4 text-left group"
            onClick={() => onSelect?.(suggestion)}
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                {suggestion.isRecent ? (
                  <History className="h-6 w-6 text-gray-600" />
                ) : (
                  <FileText className="h-6 w-6 text-gray-600" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{suggestion.displayName}</h3>
              {isPaperSuggestion && (
                <p className="mt-1 text-sm text-gray-500">
                  {suggestion.authors.slice(0, 3).join(', ')}
                  {suggestion.authors.length > 3 ? ', et al.' : ''}
                </p>
              )}
              {isPaperSuggestion && suggestion.doi && (
                <p className="mt-1 text-xs text-gray-400">DOI: {suggestion.doi}</p>
              )}
            </div>
            <div className="flex-shrink-0 self-center ml-4">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </li>
      );
    }

    return (
      <li key={isPaperSuggestion ? suggestion.id : suggestion.id}>
        <button
          type="button"
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
          onClick={() => onSelect?.(suggestion)}
        >
          <div className="flex items-start gap-3">
            {suggestion.isRecent ? (
              <History className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            ) : (
              <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="font-medium text-sm">{suggestion.displayName}</div>
              {isPaperSuggestion && (
                <div className="text-xs text-gray-500">
                  {suggestion.authors.slice(0, 3).join(', ')}
                  {suggestion.authors.length > 3 ? ', et al.' : ''}
                </div>
              )}
            </div>
          </div>
        </button>
      </li>
    );
  };

  return (
    <div
      className={cn(
        'w-full bg-white rounded-md',
        displayMode === 'dropdown' ? 'absolute z-50 mt-1 shadow-lg border border-gray-200' : 'mt-4'
      )}
    >
      {/* Local suggestions section */}
      {showSuggestionsOnFocus && !query && hasLocalSuggestions && (
        <div>
          <div
            className={cn(
              'flex items-center justify-between px-4 py-2',
              displayMode === 'dropdown' ? 'border-b' : ''
            )}
          >
            <span className="text-xs font-medium text-gray-500">Recent</span>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
          <ul
            className={cn(
              displayMode === 'inline' ? 'space-y-3' : 'divide-y divide-gray-100',
              displayMode === 'dropdown' ? 'py-2' : ''
            )}
          >
            {suggestions.map(renderSuggestion)}
          </ul>
        </div>
      )}

      {/* Combined results section */}
      {query && (
        <>
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading results...</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          )}

          {suggestions.length > 0 && (
            <ul
              className={cn(
                displayMode === 'inline' ? 'space-y-3' : 'divide-y divide-gray-100',
                displayMode === 'dropdown' ? 'py-2' : ''
              )}
            >
              {suggestions.map(renderSuggestion)}
            </ul>
          )}
        </>
      )}

      {/* Tips section */}
      {displayMode === 'dropdown' && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>Tip: {searchTips[tipIndex]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
