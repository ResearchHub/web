'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { FeedItemTopicBadges } from '@/components/Feed/FeedItemTopicBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Star } from 'lucide-react';
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
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.profileUrl,
    })) || [];

  // Use provided href or create default post page URL
  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const postPageUrl =
    href ||
    buildWorkUrl({
      id: post.id,
      slug: post.slug,
      contentType: post.postType === 'QUESTION' ? 'question' : 'post',
    });

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
    >
      {/* Top section with badges and mobile image */}
      <FeedItemTopSection
        imageSection={
          post.previewImage && (
            <ImageSection
              imageUrl={post.previewImage}
              alt={post.title || 'Post image'}
              aspectRatio="16/9"
            />
          )
        }
        rightContent={null}
        leftContent={null}
      />

      <div className="mt-[-7px]">
        <FeedItemTopicBadges
          topics={post.topics}
          category={post.category}
          subcategory={post.subcategory}
        />
      </div>

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
            />

            <MetadataSection>
              <div className="flex items-center flex-wrap text-sm">
                {authors.length > 0 && (
                  <AuthorList
                    authors={authors}
                    size="sm"
                    className="text-gray-500 font-normal text-sm"
                    delimiter="•"
                    timestamp={post.createdDate ? formatTimestamp(post.createdDate) : undefined}
                  />
                )}
                {hasReviewScore && (
                  <>
                    <span className="mx-2 text-gray-500">•</span>
                    <Tooltip
                      content={
                        <PeerReviewTooltip
                          reviews={post.reviews ?? []}
                          averageScore={reviewScore}
                          href={postPageUrl}
                        />
                      }
                      position="top"
                      width="w-[320px]"
                    >
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600 cursor-help">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {reviewScore.toFixed(1)}
                      </span>
                    </Tooltip>
                  </>
                )}
              </div>
            </MetadataSection>

            {/* Content Section - handles both desktop and mobile */}
            <FeedItemAbstractSection
              content={post.textPreview}
              highlightedContent={highlightedSnippet}
              maxLength={maxLength}
              mobileLabel="Read more"
              onAbstractExpanded={onAbstractExpanded}
            />
          </>
        }
        rightContent={
          post.previewImage && (
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
