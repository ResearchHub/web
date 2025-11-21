'use client';

import { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedCommentContent, FeedEntry } from '@/types/feed';
import { FeedPostContent, FeedPaperContent, FeedGrantContent } from '@/types/feed';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemBounty } from './items/FeedItemBounty';
import { FeedItemComment } from './items/FeedItemComment';
import { FeedItemPost } from './items/FeedItemPost';
import { FeedItemGrant } from './items/FeedItemGrant';
import { useFeedItemClick } from '@/hooks/useFeedItemClick';
import { useCallback } from 'react';
import { getUnifiedDocumentId } from '@/types/analytics';

export interface Highlight {
  field: string;
  value: string;
}

interface FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  disableCardLinks?: boolean;
  showBountyFooter?: boolean;
  hideActions?: boolean;
  showBountySupportAndCTAButtons?: boolean;
  showBountyDeadline?: boolean;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showReadMoreCTA?: boolean;
  feedView?: string;
  feedOrdering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
  clearVisibleItems: () => void;
  highlights?: Highlight[];
}

export const FeedEntryItem: FC<FeedEntryItemProps> = ({
  entry,
  index,
  disableCardLinks = false,
  showBountyFooter = true,
  hideActions = false,
  showBountySupportAndCTAButtons = true,
  showBountyDeadline = true,
  maxLength,
  showGrantHeaders = true,
  showReadMoreCTA = false,
  feedView,
  feedOrdering,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
  clearVisibleItems,
  highlights,
}) => {
  const unifiedDocumentId = getUnifiedDocumentId(entry);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '50px',
    onChange: (inView) => {
      if (unifiedDocumentId) {
        if (inView) {
          registerVisibleItem(index, unifiedDocumentId);
        } else {
          unregisterVisibleItem(index, unifiedDocumentId);
        }
      }
    },
  });

  const getImpressions = useCallback(() => {
    if (!unifiedDocumentId) return undefined;
    const visibleItems = getVisibleItems(unifiedDocumentId);

    return visibleItems.length > 0 ? visibleItems : undefined;
  }, [unifiedDocumentId, getVisibleItems]);

  // Handle feed item click with analytics
  const handleFeedItemClick = useFeedItemClick({
    entry,
    feedPosition: index + 1,
    feedOrdering,
    impression: getImpressions(),
  });

  if (!entry) {
    console.error('Feed entry is undefined');
    return null;
  }

  // Apply appropriate spacing based on position
  const spacingClass = index !== 0 ? 'mt-12' : '';

  // Generate the appropriate href for this entry
  const generateHref = (entry: FeedEntry): string | undefined => {
    // If links are disabled globally, return undefined
    if (disableCardLinks) {
      return undefined;
    }
    try {
      switch (entry.contentType) {
        case 'POST':
          const postContent = entry.content as FeedPostContent;
          // Check if this is a question based on postType
          if (postContent.postType === 'QUESTION') {
            return `/question/${postContent.id}/${postContent.slug}`;
          }
          return `/post/${postContent.id}/${postContent.slug}`;
        case 'PREREGISTRATION':
          const fundContent = entry.content as FeedPostContent;
          return `/fund/${fundContent.id}/${fundContent.slug}`;
        case 'PAPER':
          const paperContent = entry.content as FeedPaperContent;
          return `/paper/${paperContent.id}/${paperContent.slug}`;

        case 'BOUNTY':
          if (entry.relatedWork?.contentType === 'paper') {
            return `/paper/${entry.relatedWork.id}/${entry.relatedWork.slug}/bounties`;
          } else if (entry.relatedWork) {
            // Check if the related work is a question
            if ('postType' in entry.relatedWork && entry.relatedWork.postType === 'QUESTION') {
              return `/question/${entry.relatedWork.id}/${entry.relatedWork.slug}/bounties`;
            }
            return `/post/${entry.relatedWork.id}/${entry.relatedWork.slug}/bounties`;
          }
        case 'COMMENT':
          const comment = entry.content as FeedCommentContent;
          // For comments, we might want to link to the parent content with the comment ID as a hash
          if (entry.relatedWork?.contentType === 'paper') {
            return `/paper/${entry.relatedWork.id}/${entry.relatedWork.slug}/conversation#comment-${comment.id}`;
          } else if (entry.relatedWork) {
            // Check if the related work is a question
            if ('postType' in entry.relatedWork && entry.relatedWork.postType === 'QUESTION') {
              return `/question/${entry.relatedWork.id}/${entry.relatedWork.slug}/conversation#comment-${comment.id}`;
            }
            return `/post/${entry.relatedWork.id}/${entry.relatedWork.slug}/conversation#comment-${comment.id}`;
          }

        case 'GRANT':
          const grantContent = entry.content as FeedGrantContent;
          return `/grant/${grantContent.id}/${grantContent.slug}`;

        default:
          return undefined;
      }
    } catch (error) {
      console.error('Error generating href for entry:', error, entry);
      return undefined;
    }
  };

  const href = generateHref(entry);

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h: any) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h: any) => h.field === 'snippet')?.value;

  let content = null;

  try {
    // Use the contentType field on the FeedEntry object to determine the type of content
    switch (entry.contentType) {
      case 'POST':
        content = (
          <FeedItemPost
            entry={entry}
            href={href}
            showActions={!hideActions}
            maxLength={maxLength}
            onFeedItemClick={handleFeedItemClick}
            highlights={highlights}
          />
        );
        break;

      case 'PREREGISTRATION':
        content = (
          <FeedItemFundraise
            entry={entry}
            href={href}
            showActions={!hideActions}
            maxLength={maxLength}
            onFeedItemClick={handleFeedItemClick}
          />
        );
        break;

      case 'PAPER':
        content = (
          <FeedItemPaper
            entry={entry}
            href={href}
            showActions={!hideActions}
            maxLength={maxLength}
            onFeedItemClick={handleFeedItemClick}
            feedView={feedView}
            highlights={highlights}
          />
        );
        break;

      case 'BOUNTY':
        // Use the new FeedItemBounty component
        content = (
          <FeedItemBounty
            entry={entry}
            relatedDocumentId={entry.relatedWork?.id}
            href={href}
            showContributeButton={false}
            showFooter={showBountyFooter}
            showSupportAndCTAButtons={showBountySupportAndCTAButtons}
            showDeadline={showBountyDeadline}
            maxLength={maxLength}
            onFeedItemClick={handleFeedItemClick}
          />
        );
        break;

      case 'COMMENT':
        // Use FeedItemComment for comment entries
        content = (
          <FeedItemComment
            showReadMoreCTA={showReadMoreCTA}
            entry={entry}
            href={href}
            showCreatorActions={true}
            workContentType={entry.relatedWork?.contentType}
            hideActions={hideActions}
            maxLength={maxLength}
            onFeedItemClick={handleFeedItemClick}
          />
        );
        break;

      case 'GRANT':
        content = (
          <FeedItemGrant
            entry={entry}
            href={href}
            showActions={!hideActions}
            maxLength={maxLength}
            showHeader={showGrantHeaders}
            onFeedItemClick={handleFeedItemClick}
            highlights={highlights}
          />
        );
        break;

      default:
        throw new Error(`Unsupported content type: ${entry.contentType}`);
    }
  } catch (error) {
    console.error('Error rendering feed entry:', error);
    content = (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium">Error Rendering Entry - {entry.id}</h3>
        <p className="text-gray-600 mt-2">There was an error rendering this entry.</p>
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div ref={ref} className={spacingClass}>
      {content}
    </div>
  );
};
