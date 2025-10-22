import { useState } from 'react';
import { FileText, History, Search, X, ArrowRight, User, Hash, HelpCircle } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/utils/styles';
import { SearchSuggestion } from '@/types/search';
import type { EntityType } from '@/types/search';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

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
      const isPostSuggestion = suggestion.entityType === 'post';
      const isGrantPost =
        isPostSuggestion && 'documentType' in suggestion && suggestion.documentType === 'GRANT';

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

      const isUserVerified = () => {
        if (isUserSuggestion) {
          return (
            suggestion.isVerified ||
            suggestion.authorProfile?.isVerified ||
            suggestion.authorProfile?.user?.isVerified
          );
        }
        return false;
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
        if (isGrantPost)
          return (
            <div style={{ padding: '5px' }}>
              <Icon name="fund" size={24} className="text-gray-600" />
            </div>
          );
        if (isPostSuggestion) return <FileText className="h-6 w-6 text-gray-600" />;
        return <HelpCircle className="h-6 w-6 text-gray-600" />; // Default with a more distinctive fallback icon
      };

      // Get the smaller icon variant for dropdown mode
      const getSmallIcon = () => {
        if (suggestion.isRecent)
          return <History className="h-5 w-8 text-gray-400 mt-0.5 flex-shrink-0" />;
        if (isPaperSuggestion)
          return <FileText className="h-5 w-8 text-gray-500 mt-0.5 flex-shrink-0" />;
        if (isUserSuggestion) {
          const authorProfile = suggestion.authorProfile;
          return authorProfile?.profileImage ? (
            <Avatar
              src={authorProfile.profileImage}
              alt={suggestion.displayName}
              size="sm"
              className="mt-0.5 flex-shrink-0"
              authorId={authorProfile.id}
            />
          ) : (
            <User className="h-5 w-8 text-gray-500 mt-0.5 flex-shrink-0" />
          );
        }
        if (isTopicSuggestion)
          return <Hash className="h-5 w-8 text-gray-500 mt-0.5 flex-shrink-0" />;
        if (isGrantPost)
          return (
            <div style={{ padding: '6px' }} className="mt-0.5 flex-shrink-0">
              <Icon name="fund" size={20} className="text-gray-500" />
            </div>
          );
        if (isPostSuggestion)
          return <FileText className="h-5 w-8 text-gray-500 mt-0.5 flex-shrink-0" />;
        return <HelpCircle className="h-5 w-8 text-gray-500 mt-0.5 flex-shrink-0" />; // Default
      };

      if (displayMode === 'inline') {
        return (
          <li key={suggestionKey}>
            <div
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 text-left group cursor-pointer border-l-2 border-transparent hover:border-l-gray-300"
              onClick={(e) => handleSelect(suggestion, e)}
            >
              <div className="flex-shrink-0">{getSmallIcon()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {truncateText(suggestion.displayName, MAX_TITLE_LENGTH)}
                  </h3>
                  {isUserSuggestion && isUserVerified() && <VerifiedBadge size="sm" />}
                </div>
                {isPaperSuggestion && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {safeGetAuthorsList()}
                    {safeGetPublishedYear()}
                  </p>
                )}
                {isUserSuggestion && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{safeGetHeadline()}</p>
                )}
                {isTopicSuggestion && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    Topic • {safeGetPaperCount()}
                  </p>
                )}
              </div>
              {isTopicSuggestion && suggestion.id && (
                <FollowTopicButton
                  topicId={suggestion.id}
                  size="sm"
                  className="text-xs py-1 px-2 h-6 follow-topic-btn opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
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
                <div className="flex items-center gap-1">
                  <div className="font-medium text-sm">
                    {truncateText(suggestion.displayName, MAX_TITLE_LENGTH)}
                  </div>
                  {isUserSuggestion && isUserVerified() && <VerifiedBadge size="sm" />}
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

  // Group suggestions by recent vs search results for inline mode
  const recentSuggestions = safeSuggestions.filter((s) => s.isRecent);
  const searchResults = safeSuggestions.filter((s) => !s.isRecent);

  return (
    <div
      className={cn(
        'w-full bg-white rounded-md',
        displayMode === 'dropdown' ? 'absolute z-50 mt-1 shadow-lg border border-gray-200' : ''
      )}
    >
      {/* Local suggestions section */}
      {showSuggestionsOnFocus && !query && hasLocalSuggestions && (
        <div>
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3',
              displayMode === 'dropdown' ? 'border-b' : ''
            )}
          >
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Recent
            </span>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
          <ul className={displayMode === 'inline' ? '' : 'divide-y divide-gray-100 py-2'}>
            {safeSuggestions.map(renderSuggestion)}
          </ul>
        </div>
      )}

      {/* Search results sections */}
      {query && (
        <>
          {loading && safeSuggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2"></div>
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {!loading && safeSuggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
            </div>
          )}

          {safeSuggestions.length > 0 && displayMode === 'inline' && (
            <>
              {/* Recent results section */}
              {recentSuggestions.length > 0 && (
                <div>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Recent
                    </span>
                  </div>
                  <ul>{recentSuggestions.map(renderSuggestion)}</ul>
                </div>
              )}

              {/* Search results section */}
              {searchResults.length > 0 && (
                <div>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Results
                    </span>
                  </div>
                  <ul>{searchResults.map(renderSuggestion)}</ul>
                </div>
              )}
            </>
          )}

          {safeSuggestions.length > 0 && displayMode === 'dropdown' && (
            <ul className="divide-y divide-gray-100 py-2">
              {safeSuggestions.map(renderSuggestion)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
