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
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { Users, Building, Pin } from 'lucide-react';
import TopicAndJournalBadges from '@/components/ui/TopicAndJournalBadges';

interface FeedItemFundraiseProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  badgeVariant?: 'default' | 'icon-only';
  showActions?: boolean;
  maxLength?: number;
  customActionText?: string;
  isPinnedFundraise?: boolean;
  onFeedItemClick?: () => void;
}

/**
 * Helper function to extract contributors from fundraise data
 */
const extractContributors = (fundraise: FeedPostContent['fundraise']) => {
  if (!fundraise || !fundraise.contributors || !fundraise.contributors.topContributors) {
    return [];
  }

  return fundraise.contributors.topContributors.map((contributor) => ({
    profileImage: contributor.authorProfile.profileImage,
    fullName: contributor.authorProfile.fullName,
    profileUrl: contributor.authorProfile.profileUrl,
  }));
};

/**
 * Component for rendering a fundraise feed item using BaseFeedItem
 */
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({
  entry,
  href,
  showTooltips = true,
  badgeVariant = 'default',
  showActions = true,
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
            <ContentTypeBadge type="funding" />
            {isNonprofit && <TaxDeductibleBadge variant={badgeVariant} />}
            <TopicAndJournalBadges topics={topics} />
          </>
        }
      />

      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={post.title} />

            {/* Authors list below title */}
            {authors.length > 0 && (
              <MetadataSection>
                <div className="mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <AuthorList
                    authors={authors}
                    size="xs"
                    className="text-gray-500 font-normal text-sm"
                    delimiter="•"
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
            showContribute={true}
            className="p-0 border-0 bg-transparent"
          />
        </div>
      )}
    </BaseFeedItem>
  );
};
