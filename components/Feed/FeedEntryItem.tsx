'use client';

import { FC, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { useFeedContentTracking } from '@/contexts/FeedContentTracking';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import {
  FeedPostContent,
  FeedPaperContent,
  FeedBountyContent,
  FeedGrantContent,
} from '@/types/feed';
import { Comment } from '@/types/comment';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemBounty } from './items/FeedItemBounty';
import { FeedItemComment } from './items/FeedItemComment';
import { FeedItemPost } from './items/FeedItemPost';
import { FeedItemGrant } from './items/FeedItemGrant';

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
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '50px',
  });

  const { setDisplayedItems, displayedItems } = useFeedContentTracking();

  // Track when entry comes into view
  useEffect(() => {
    if (inView && entry) {
      // Check if this entry is not already in displayedItems
      const isAlreadyDisplayed = displayedItems.some((item) => item.id === entry.id);

      if (!isAlreadyDisplayed) {
        setDisplayedItems((prev) => [...prev, entry]);
      }
    }
  }, [inView, entry, displayedItems, setDisplayedItems]);

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
          const comment = entry.content as Comment;
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
