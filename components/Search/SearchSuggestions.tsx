import { useState } from 'react';
import { FileText, History, Search, X, ArrowRight, User, Hash, HelpCircle } from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/utils/styles';
import { SearchSuggestion } from '@/types/search';
import type { EntityType } from '@/types/search';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';

interface SearchSuggestionsProps {
  query: string;
  isFocused?: boolean;
  onSelect?: (suggestion: SearchSuggestion) => void;
  displayMode?: 'dropdown' | 'inline';
  showSuggestionsOnFocus?: boolean;
  indices?: EntityType[];
}

// Maximum number of search results to display
const MAX_RESULTS = 7;
// Maximum length for titles before truncating
const MAX_TITLE_LENGTH = 100;

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export function SearchSuggestions({
  query,
  isFocused = true,
  onSelect,
  displayMode = 'dropdown',
  showSuggestionsOnFocus = true,
  indices,
}: SearchSuggestionsProps) {
  const [erroredSuggestions, setErroredSuggestions] = useState<Set<string>>(new Set());
  const { loading, suggestions, hasLocalSuggestions, clearSearchHistory } = useSearchSuggestions({
    query,
    indices,
    includeLocalSuggestions: true,
  });

  // Only hide when explicitly not focused
  if (isFocused === false) {
    return null;
  }

  const handleSelect = (suggestion: SearchSuggestion, e: React.MouseEvent) => {
    // Don't select if we clicked on a FollowTopicButton
    if ((e.target as HTMLElement).closest('.follow-topic-btn')) {
      return;
    }

    // Call the onSelect handler
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const renderSuggestion = (suggestion: SearchSuggestion) => {
    try {
      // Create a unique key based on entity type and identifier
      const suggestionId = suggestion.id || '';
      const suggestionDoi =
        suggestion.entityType === 'paper' && 'doi' in suggestion ? suggestion.doi : '';
      const contentType =
        suggestion.entityType === 'paper' && 'contentType' in suggestion
          ? suggestion.contentType
          : '';
      const suggestionKey = `${suggestion.entityType}-${contentType}-${suggestionId || suggestionDoi}`;

      // Skip rendering this suggestion if it previously caused an error
      if (erroredSuggestions.has(suggestionKey)) {
        return null;
      }

      const isPaperSuggestion = suggestion.entityType === 'paper';
      const isUserSuggestion =
        suggestion.entityType === 'user' || suggestion.entityType === 'author';
      const isTopicSuggestion = suggestion.entityType === 'hub';

      // Safely access nested properties
      const safeGetAuthorsList = () => {
        if (isPaperSuggestion && 'authors' in suggestion && Array.isArray(suggestion.authors)) {
          return (
            suggestion.authors.slice(0, 3).join(', ') +
            (suggestion.authors.length > 3 ? ', et al.' : '')
          );
        }
        return '';
      };

      const safeGetPublishedYear = () => {
        if (isPaperSuggestion && 'publishedDate' in suggestion && suggestion.publishedDate) {
          try {
            return ` • ${new Date(suggestion.publishedDate).getFullYear()}`;
          } catch (e) {
            return '';
          }
        }
        return '';
      };

      const safeGetHeadline = () => {
        if (isUserSuggestion && 'authorProfile' in suggestion) {
          const headline = suggestion.authorProfile?.headline;
          return typeof headline === 'string' ? headline : 'User';
        }
        return 'User';
      };

      const safeGetPaperCount = () => {
        if (isTopicSuggestion && 'paperCount' in suggestion) {
          return suggestion.paperCount ? `${suggestion.paperCount} papers` : 'Research Topic';
        }
        return 'Research Topic';
      };

      // Get the appropriate icon for the suggestion type
      const getIcon = () => {
        if (suggestion.isRecent) return <History className="h-6 w-6 text-gray-600" />;
        if (isPaperSuggestion) return <FileText className="h-6 w-6 text-gray-600" />;
        if (isUserSuggestion) return <User className="h-6 w-6 text-gray-600" />;
        if (isTopicSuggestion) return <Hash className="h-6 w-6 text-gray-600" />;
        return <HelpCircle className="h-6 w-6 text-gray-600" />; // Default with a more distinctive fallback icon
      };

      // Get the smaller icon variant for dropdown mode
      const getSmallIcon = () => {
        if (suggestion.isRecent)
          return <History className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />;
        if (isPaperSuggestion)
          return <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />;
        if (isUserSuggestion)
          return <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />;
        if (isTopicSuggestion)
          return <Hash className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />;
        return <HelpCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />; // Default
      };

      if (displayMode === 'inline') {
        return (
          <li key={suggestionKey}>
            <div
              className="w-full p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:translate-x-1 transition-all duration-200 flex items-start gap-4 text-left group cursor-pointer"
              onClick={(e) => handleSelect(suggestion, e)}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                  {getIcon()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 cursor-pointer">
                  {truncateText(suggestion.displayName, MAX_TITLE_LENGTH)}
                </h3>
                {isPaperSuggestion && (
                  <p className="mt-1 text-sm text-gray-500">
                    {safeGetAuthorsList()}
                    {safeGetPublishedYear()}
                  </p>
                )}
                {isUserSuggestion && (
                  <p className="mt-1 text-sm text-gray-500">
                    {safeGetHeadline()} • {}
                  </p>
                )}
                {isTopicSuggestion && (
                  <div className="flex justify-between items-center">
                    <p className="mt-1 text-sm text-gray-500 cursor-pointer">
                      Topic • {safeGetPaperCount()}
                    </p>
                    {suggestion.id && (
                      <FollowTopicButton
                        topicId={suggestion.id}
                        className="ml-2 follow-topic-btn"
                      />
                    )}
                  </div>
                )}
                {isPaperSuggestion && 'doi' in suggestion && suggestion.doi && (
                  <p className="mt-1 text-xs text-gray-400">DOI: {suggestion.doi}</p>
                )}
              </div>
              <div className="flex-shrink-0 self-center ml-4 cursor-pointer">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </li>
        );
      }

      // For dropdown mode
      return (
        <li
          key={suggestionKey}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={(e) => handleSelect(suggestion, e)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              {getSmallIcon()}
              <div>
                <div className="font-medium text-sm">
                  {truncateText(suggestion.displayName, MAX_TITLE_LENGTH)}
                </div>
                {isPaperSuggestion && (
                  <div className="text-xs text-gray-500">
                    {safeGetAuthorsList()}
                    {safeGetPublishedYear()}
                  </div>
                )}
                {isUserSuggestion && (
                  <div className="text-xs text-gray-500">{safeGetHeadline()}</div>
                )}
                {isTopicSuggestion && (
                  <div className="text-xs text-gray-500">Topic • {safeGetPaperCount()}</div>
                )}
              </div>
            </div>
            {isTopicSuggestion && suggestion.id && (
              <FollowTopicButton
                topicId={suggestion.id}
                size="sm"
                className="text-xs py-1 px-2 h-6 follow-topic-btn"
              />
            )}
          </div>
        </li>
      );
    } catch (error) {
      // If rendering this suggestion causes an error, remember it and skip it next time
      console.error('Error rendering suggestion:', error, suggestion);

      try {
        const errorKey = `${suggestion.entityType}-${
          'contentType' in suggestion ? suggestion.contentType : ''
        }-${suggestion.id || ''}`;
        setErroredSuggestions((prev) => new Set([...prev, errorKey]));
      } catch (e) {
        // Last resort fallback
      }

      // Return null instead of crashing
      return null;
    }
  };

  // Filter out any suggestions that might cause rendering issues
  const safeSuggestions = suggestions
    .filter((suggestion) => {
      try {
        return suggestion && typeof suggestion === 'object' && 'entityType' in suggestion;
      } catch {
        return false;
      }
    })
    .slice(0, MAX_RESULTS); // Limit to maximum number of results

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
            {safeSuggestions.map(renderSuggestion)}
          </ul>
        </div>
      )}

      {/* Combined results section */}
      {query && (
        <>
          {loading && safeSuggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading results...</div>
          )}

          {!loading && safeSuggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          )}

          {safeSuggestions.length > 0 && (
            <ul
              className={cn(
                displayMode === 'inline' ? 'space-y-3' : 'divide-y divide-gray-100',
                displayMode === 'dropdown' ? 'py-2' : ''
              )}
            >
              {safeSuggestions.map(renderSuggestion)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
