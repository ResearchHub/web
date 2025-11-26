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
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemActions } from './FeedItemActions';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { useFeedItemClick } from '@/hooks/useFeedItemClick';
import { useCallback } from 'react';
import { getUnifiedDocumentId } from '@/types/analytics';
import { Work } from '@/types/work';
import { BountyContribution } from '@/types/bounty';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { buildWorkUrl } from '@/utils/url';
import { useRouter, useParams } from 'next/navigation';
import { calculateTotalAwardedAmount } from '@/components/Bounty/lib/bountyUtil';
import { FeedItemBountyComment } from './items/FeedItemBountyComment';

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
}) => {
  const unifiedDocumentId = getUnifiedDocumentId(entry);
  const router = useRouter();
  const params = useParams();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

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
          />
        );
        break;

      case 'BOUNTY':
        // Transform bounty entry to Post/Paper with bounty info
        const bountyEntry = entry.content as FeedBountyContent;

        // Handle CTA button click (Add Review/Add Solution)
        const handleSolution = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          let workId: string | number | undefined;
          let workSlug: string | undefined;
          let workContentType: string | undefined;
          let workPostType: string | undefined;

          if (entry.relatedWork) {
            workId = entry.relatedWork.id;
            workSlug = entry.relatedWork.slug;
            workContentType = entry.relatedWork.contentType;
            workPostType = entry.relatedWork.postType;
          } else {
            const { id: paramId, slug: paramSlug } = params;
            workId = paramId as string | number | undefined;
            workSlug = paramSlug as string | undefined;
            workContentType = bountyEntry.relatedDocumentContentType;
          }

          if (!workId || !workContentType) {
            console.error('FeedEntryItem: Unable to determine destination for CTA', {
              workId,
              workSlug,
              workContentType,
              entry,
            });
            return;
          }

          const targetTab = workPostType === 'QUESTION' ? 'conversation' : 'reviews';

          if (workPostType === 'QUESTION') {
            workContentType = 'question';
          }

          const workUrl = buildWorkUrl({
            id: workId.toString(),
            contentType: workContentType as any,
            slug: workSlug,
            tab: targetTab,
          });
          const urlWithFocus = `${workUrl}?focus=true`;

          router.push(urlWithFocus);
        };

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
                    onAddSolutionClick={handleSolution}
                  />
                ) : (
                  <FeedItemPost
                    entry={relatedWorkEntry}
                    href={href}
                    showActions={showBountyFooter}
                    maxLength={maxLength}
                    onFeedItemClick={handleFeedItemClick}
                    onAddSolutionClick={handleSolution}
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
