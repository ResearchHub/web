'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { FeedItemMenuButton } from '@/components/Feed/FeedItemMenuButton';
import { FeedItemBadges } from '@/components/Feed/FeedItemBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { buildWorkUrl } from '@/utils/url';

interface FeedItemPostProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  onAbstractExpanded?: () => void;
  highlights?: Highlight[];
  showHeader?: boolean;
  showBountyInfo?: boolean;
  compact?: boolean; // Add compact prop
}

/**
 * Post Feed Item using BaseFeedItem
 */
export const FeedItemPost: FC<FeedItemPostProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  showHeader = true,
  maxLength,
  onFeedItemClick,
  onAbstractExpanded,
  highlights,
  showBountyInfo,
  compact = false, // Initialize compact prop
}) => {
  ...
  return (
    <BaseFeedItem
      entry={entry}
      href={postPageUrl}
      showActions={showActions}
      showHeader={showHeader}
      showTooltips={showTooltips}
      customActionText={post.postType === 'QUESTION' ? 'asked a question' : 'published an article'}
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showPeerReviews={post.postType !== 'QUESTION'}
      showBountyInfo={showBountyInfo}
      hideReportButton={true}
      compact={compact}
    >
      {/* Top section with badges and mobile image */}
      <FeedItemTopSection
        imageSection={
          post.previewImage &&
          !compact && ( // Hide image in compact mode
            <ImageSection
              imageUrl={post.previewImage}
              alt={post.title || 'Post image'}
              aspectRatio="16/9"
            />
          )
        }
        ...
      />
      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection
              title={post.title}
              highlightedTitle={highlightedTitle}
              href={postPageUrl}
              onClick={onFeedItemClick}
              className={cn(compact && 'text-sm md:!text-base mb-0')}
            />

            <div>
              {/* Authors list below title */}
              {authors.length > 0 && (
                <MetadataSection className={cn(compact && 'mb-0')}>
                  <div className="flex items-start gap-1.5">
                    <AuthorList
                      authors={authors}
                      size="sm"
                      className={cn('text-gray-500 font-normal text-sm', compact && 'text-xs')}
                      delimiter="•"
                      timestamp={post.createdDate ? formatTimestamp(post.createdDate) : undefined}
                    />
                  </div>
                </MetadataSection>
              )}
            </div>

            {/* Content Section - handles both desktop and mobile */}
            {!compact && ( // Hide abstract in compact mode
              <FeedItemAbstractSection
                content={post.textPreview}
                highlightedContent={highlightedSnippet}
                maxLength={maxLength}
                mobileLabel="Read more"
                onAbstractExpanded={onAbstractExpanded}
              />
            )}
          </>
        }
        rightContent={
          post.previewImage &&
          !compact && ( // Hide image in compact mode
            <ImageSection
              imageUrl={post.previewImage}
              alt={post.title || 'Post image'}
              aspectRatio="4/3"
            />
          )
        }
      />
    </BaseFeedItem>
  );
};
