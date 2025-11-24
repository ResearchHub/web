'use client';

import { FC } from 'react';
import { SearchResult as SearchResultType } from '@/types/searchResult';
import { FeedEntryItem, Highlight } from '@/components/Feed/FeedEntryItem';
import { useFeedImpressionTracking } from '@/hooks/useFeedImpressionTracking';

interface SearchResultProps {
  searchResult: SearchResultType;
  index: number;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showReadMoreCTA?: boolean;
}

/**
 * SearchResult component renders a search result with highlights
 * by delegating to FeedEntryItem with highlights prop
 */
export const SearchResult: FC<SearchResultProps> = ({
  searchResult,
  index,
  maxLength,
  showGrantHeaders = true,
  showReadMoreCTA = true,
}) => {
  const { entry, highlightedTitle, highlightedSnippet } = searchResult;
  const { registerVisibleItem, unregisterVisibleItem, getVisibleItems } =
    useFeedImpressionTracking();

  // Only render supported content types (no BOUNTY or COMMENT in search)
  const supportedTypes = ['POST', 'PAPER', 'PREREGISTRATION', 'GRANT'];
  if (!supportedTypes.includes(entry.contentType)) {
    console.warn(`Unsupported search result content type: ${entry.contentType}`);
    return null;
  }

  // Build highlights array from highlightedTitle and highlightedSnippet
  const highlights: Highlight[] = [];
  if (highlightedTitle) {
    highlights.push({ field: 'title', value: highlightedTitle });
  }
  if (highlightedSnippet) {
    highlights.push({ field: 'snippet', value: highlightedSnippet });
  }

  return (
    <FeedEntryItem
      entry={entry}
      index={index}
      hideActions={true}
      maxLength={maxLength}
      showGrantHeaders={showGrantHeaders}
      showReadMoreCTA={showReadMoreCTA}
      highlights={highlights}
      registerVisibleItem={registerVisibleItem}
      unregisterVisibleItem={unregisterVisibleItem}
      getVisibleItems={getVisibleItems}
    />
  );
};
