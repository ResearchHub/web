'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ContentSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { AuthorList } from '@/components/ui/AuthorList';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgressV2';
import { Users, Building, Pin } from 'lucide-react';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { formatTimestamp } from '@/utils/date';

interface FeedItemFundraiseProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  showHeader?: boolean;
  maxLength?: number;
  customActionText?: string;
  isPinnedFundraise?: boolean;
  onFeedItemClick?: () => void;
}

/**
 * Component for rendering a fundraise feed item using BaseFeedItem
 */
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  showHeader = true,
  maxLength,
  customActionText,
  isPinnedFundraise = false,
  onFeedItemClick,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Check if this is a proposal with fundraise data
  const hasFundraise = post.contentType === 'PREREGISTRATION' && post.fundraise;

  // Get topics/tags for display
  const topics = post.topics || [];

  // Check if the entry has the is_nonprofit flag and is a funding type
  const isNonprofit =
    entry.raw?.is_nonprofit === true && post.contentType === 'PREREGISTRATION' && post.fundraise;

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.profileUrl,
    })) || [];

  // Use provided href or create default funding page URL
  const fundingPageUrl = href || `/fund/${post.id}/${post.slug}`;

  // Image URL
  const imageUrl = post.previewImage ?? undefined;

  return (
    <BaseFeedItem
      entry={entry}
      href={fundingPageUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={
        customActionText ?? (hasFundraise ? `is seeking funding` : 'published a post')
      }
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showBountyInfoSummary={false}
      showHeader={showHeader}
    >
      {/* Pin icon in top right corner for pinned fundraises */}
      {isPinnedFundraise && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <Pin className="w-4 h-4 text-blue-600" />
        </div>
      )}

      {/* Top section with badges and mobile image */}
      <FeedItemTopSection
        imageSection={
          imageUrl && (
            <ImageSection
              imageUrl={imageUrl}
              alt={post.title || 'Fundraise image'}
              aspectRatio="16/9"
            />
          )
        }
        leftContent={
          <>
            {showHeader && <ContentTypeBadge type="funding" />}
            {isNonprofit && <TaxDeductibleBadge />}
            {topics.map((topic) => (
              <TopicAndJournalBadge
                key={topic.id || topic.slug}
                name={topic.name}
                slug={topic.slug}
              />
            ))}
          </>
        }
      />

      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={post.title} />

            {/* Authors list */}
            {authors.length > 0 && (
              <MetadataSection>
                <div className="mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <AuthorList
                    authors={authors}
                    size="sm"
                    className="text-gray-500 font-normal text-sm"
                    delimiter="•"
                    timestamp={post.createdDate ? formatTimestamp(post.createdDate) : undefined}
                  />
                </div>
              </MetadataSection>
            )}

            {/* Institution */}
            {post.institution && (
              <MetadataSection>
                <div className="mt-1 mb-3 flex items-center gap-1.5 text-sm text-gray-500">
                  <Building className="w-4 h-4" />
                  <span>{post.institution}</span>
                </div>
              </MetadataSection>
            )}

            {/* Truncated Content */}
            <ContentSection content={post.textPreview} maxLength={maxLength} />
          </>
        }
        rightContent={
          imageUrl && (
            <ImageSection
              imageUrl={imageUrl}
              alt={post.title || 'Fundraise image'}
              aspectRatio="4/3"
            />
          )
        }
      />
      {/* Fundraise Progress (only for preregistrations with fundraise) */}
      {hasFundraise && post.fundraise && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <FundraiseProgress
            fundraiseTitle={post.title}
            fundraise={post.fundraise}
            compact={true}
          />
        </div>
      )}
    </BaseFeedItem>
  );
};
