'use client';

import { FC } from 'react';
import { FeedCommentContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
import { FeedPostContent, FeedPaperContent, FeedGrantContent } from '@/types/feed';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemBounty } from './items/FeedItemBounty';
import { FeedItemComment } from './items/FeedItemComment';
import { FeedItemPost } from './items/FeedItemPost';
import { FeedItemGrant } from './items/FeedItemGrant';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { FeedItemClickedEvent } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useFeedSource } from '@/hooks/useFeedSource';
import { Topic } from '@/types/topic';
import { useDeviceType } from '@/hooks/useDeviceType';

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
  const { user } = useUser();
  const { source: feedSource, tab: feedTab } = useFeedSource();
  const deviceType = useDeviceType();
  // Handle feed item click with analytics
  const handleFeedItemClick = () => {
    try {
      const payload: FeedItemClickedEvent = {
        device_type: deviceType,
        feed_position: index + 1,
        feed_source: feedSource,
        feed_tab: feedTab,
        related_work: {
          id: entry.content.id?.toString() || '',
          content_type:
            'relatedDocumentContentType' in entry.content &&
            entry.content.relatedDocumentContentType
              ? entry.content.relatedDocumentContentType
              : mapFeedContentTypeToContentType(entry.content.contentType) || 'post',
          topics:
            ('topics' in entry.content ? entry.content.topics : entry.relatedWork?.topics)?.map(
              (topic: Topic) => ({
                id: topic?.id?.toString(),
                name: topic?.name,
                slug: topic?.slug,
              })
            ) || [],
          primary_topic: ('topics' in entry.content
            ? entry.content.topics
            : entry.relatedWork?.topics)?.[0] && {
            id: ('topics' in entry.content
              ? entry.content.topics
              : entry.relatedWork?.topics)?.[0]?.id?.toString(),
            name: ('topics' in entry.content
              ? entry.content.topics
              : entry.relatedWork?.topics)?.[0]?.name,
            slug: ('topics' in entry.content
              ? entry.content.topics
              : entry.relatedWork?.topics)?.[0]?.slug,
          },
          unified_document_id:
            'unifiedDocumentId' in entry.content
              ? entry.content.unifiedDocumentId
              : entry.relatedWork?.unifiedDocumentId?.toString() || '',
        },
      };

      AnalyticsService.logEventWithUserProperties(LogEvent.FEED_ITEM_CLICKED, payload, user);
    } catch (analyticsError) {
      console.error('Failed to track feed item click analytics:', analyticsError);
    }
  };

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

  return <div className={spacingClass}>{content}</div>;
};
