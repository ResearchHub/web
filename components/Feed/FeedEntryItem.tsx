'use client';

import { FC, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FeedCommentContent,
  FeedEntry,
  FeedBountyContent,
  FeedPostContent,
  FeedPaperContent,
  FeedGrantContent,
  createFeedEntryFromWork,
} from '@/types/feed';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemComment } from './items/FeedItemComment';
import { FeedItemPost } from './items/FeedItemPost';
import { FeedItemGrant } from './items/FeedItemGrant';
import { useFeedItemClick } from '@/hooks/useFeedItemClick';
import { useCallback } from 'react';
import { getUnifiedDocumentId } from '@/types/analytics';
import { buildWorkUrl } from '@/utils/url';
import { useRouter, useParams } from 'next/navigation';
import { FeedItemBountyComment } from './items/FeedItemBountyComment';

export interface Highlight {
  field: string;
  value: string;
}

interface FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  showBountyFooter?: boolean;
  hideActions?: boolean;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showFundraiseHeaders?: boolean;
  showReadMoreCTA?: boolean;
  feedOrdering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
  shouldRenderBountyAsComment?: boolean;
  highlights?: Highlight[];
}

export const FeedEntryItem: FC<FeedEntryItemProps> = ({
  entry,
  index,
  showBountyFooter = true,
  hideActions = false,
  maxLength,
  showGrantHeaders = true,
  showFundraiseHeaders = true,
  showReadMoreCTA = false,
  feedOrdering,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
  shouldRenderBountyAsComment = false,
  highlights,
}) => {
  const unifiedDocumentId = getUnifiedDocumentId(entry);
  const router = useRouter();
  const params = useParams();

  const { ref } = useInView({
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
            showHeader={showFundraiseHeaders}
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
            highlights={highlights}
          />
        );
        break;

      case 'BOUNTY':
        const bountyEntry = entry.content as FeedBountyContent;

        // Determine which component to render based on relatedWork
        const relatedWorkEntry = entry.relatedWork
          ? createFeedEntryFromWork(entry.relatedWork, entry)
          : null;
        const workContentType =
          entry.relatedWork?.contentType || bountyEntry.relatedDocumentContentType;

        if (shouldRenderBountyAsComment) {
          content = (
            <FeedItemBountyComment
              entry={entry}
              relatedDocumentId={entry.relatedWork?.id}
              href={href}
              showContributeButton={false}
              showFooter={showBountyFooter}
              showSupportAndCTAButtons={false}
              showDeadline={false}
              maxLength={maxLength}
              onFeedItemClick={handleFeedItemClick}
            />
          );
        } else {
          content = (
            <div className="space-y-3">
              {/* Render Post or Paper based on relatedWork */}
              {relatedWorkEntry &&
                (workContentType === 'paper' ? (
                  <FeedItemPaper
                    entry={relatedWorkEntry}
                    href={href}
                    showActions={showBountyFooter}
                    maxLength={maxLength}
                    onFeedItemClick={handleFeedItemClick}
                    highlights={highlights}
                  />
                ) : (
                  <FeedItemPost
                    entry={relatedWorkEntry}
                    href={href}
                    showActions={showBountyFooter}
                    maxLength={maxLength}
                    onFeedItemClick={handleFeedItemClick}
                    highlights={highlights}
                  />
                ))}
            </div>
          );
        }
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
  } catch (error) {}

  return (
    <div ref={ref} className={spacingClass}>
      {content}
    </div>
  );
};
