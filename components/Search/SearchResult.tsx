'use client';

import { FC } from 'react';
import { SearchResult as SearchResultType } from '@/types/searchResult';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import { FeedItemGrant } from '@/components/Feed/items/FeedItemGrant';
import { FeedItemBounty } from '@/components/Feed/items/FeedItemBounty';
import { FeedItemComment } from '@/components/Feed/items/FeedItemComment';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { buildWorkUrl } from '@/utils/url';

interface SearchResultProps {
  searchResult: SearchResultType;
  index: number;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showReadMoreCTA?: boolean;
}

/**
 * SearchResult component renders a search result with highlights
 * by delegating to the appropriate FeedItem* component
 */
export const SearchResult: FC<SearchResultProps> = ({
  searchResult,
  index,
  maxLength,
  showGrantHeaders = true,
  showReadMoreCTA = true,
}) => {
  const { entry, highlightedTitle, highlightedSnippet } = searchResult;

  // Build the href for the entry
  const href = buildWorkUrl({
    id: entry.content.id,
    contentType: entry.contentType === 'PAPER' ? 'paper' : 'post',
    slug: 'slug' in entry.content ? entry.content.slug : undefined,
  });

  // Render the appropriate component based on contentType
  switch (entry.contentType) {
    case 'POST':
      return (
        <FeedItemPost
          entry={entry}
          href={href}
          showActions={false}
          maxLength={maxLength}
          highlightedTitle={highlightedTitle}
          highlightedSnippet={highlightedSnippet}
        />
      );

    case 'PREREGISTRATION':
      return (
        <FeedItemFundraise entry={entry} href={href} showActions={false} maxLength={maxLength} />
      );

    case 'PAPER':
      return (
        <FeedItemPaper
          entry={entry}
          href={href}
          showActions={false}
          maxLength={maxLength}
          highlightedTitle={highlightedTitle}
          highlightedSnippet={highlightedSnippet}
        />
      );

    case 'BOUNTY':
      return (
        <FeedItemBounty
          entry={entry}
          relatedDocumentId={entry.relatedWork?.id}
          href={href}
          showContributeButton={false}
          showFooter={false}
          showSupportAndCTAButtons={false}
          showDeadline={false}
          maxLength={maxLength}
        />
      );

    case 'COMMENT':
      return <FeedItemComment entry={entry} href={href} hideActions={true} maxLength={maxLength} />;

    case 'GRANT':
      return (
        <FeedItemGrant
          entry={entry}
          href={href}
          showActions={false}
          maxLength={maxLength}
          showHeader={showGrantHeaders}
          highlightedTitle={highlightedTitle}
          highlightedSnippet={highlightedSnippet}
        />
      );

    default:
      console.warn(`Unknown content type: ${entry.contentType}`);
      return null;
  }
};
