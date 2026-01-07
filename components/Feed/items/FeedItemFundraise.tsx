'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ContentSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemMenuButton } from '@/components/Feed/FeedItemMenuButton';
import { FeedItemBadges } from '@/components/Feed/FeedItemBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgressV2';
import { Users, Building, Pin } from 'lucide-react';
import { formatTimestamp } from '@/utils/date';
import { useRouter } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';

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
  const router = useRouter();
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
  const fundingPageUrl =
    href ||
    buildWorkUrl({
      id: post.id,
      slug: post.slug,
      contentType: 'preregistration',
    });

  // Image URL
  const imageUrl = post.previewImage ?? undefined;

  const handleFundDetailsClick = () => {
    if (onFeedItemClick) {
      onFeedItemClick();
    }
    router.push(fundingPageUrl);
  };

  // Extract props for FeedItemMenuButton (same as BaseFeedItem uses for FeedItemActions)
  const feedContentType = post.contentType || 'PREREGISTRATION';
  const votableEntityId = post.id;
  const relatedDocumentId =
    'relatedDocumentId' in post ? post.relatedDocumentId?.toString() : post.id.toString();
  const relatedDocumentContentType =
    // 'relatedDocumentContentType' in post
    // ? post.relatedDocumentContentType
    // :
    mapFeedContentTypeToContentType(post.contentType);

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
      showBountyInfo={false}
      showHeader={showHeader}
      hideReportButton={true}
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
        rightContent={
          <FeedItemMenuButton
            feedContentType={feedContentType}
            votableEntityId={votableEntityId}
            relatedDocumentId={relatedDocumentId}
            relatedDocumentContentType={relatedDocumentContentType}
            relatedDocumentUnifiedDocumentId={post.unifiedDocumentId}
          />
        }
        leftContent={
          <>
            {isNonprofit && <TaxDeductibleBadge />}
            <FeedItemBadges
              topics={topics}
              category={post.category}
              subcategory={post.subcategory}
            />
          </>
        }
      />

      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={post.title} href={fundingPageUrl} />

            {/* Authors list */}
            <MetadataSection className="mb-1">
              <div className="flex items-center flex-wrap text-base">
                {authors.length > 0 && (
                  <AuthorList
                    authors={authors}
                    size="base"
                    className="text-gray-500 font-normal text-sm"
                    delimiter=","
                    delimiterClassName="ml-0"
                    showAbbreviatedInMobile={true}
                    hideExpandButton={true}
                  />
                )}
                {post.createdDate && (
                  <>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-600 whitespace-nowrap text-sm">
                      {formatTimestamp(post.createdDate, false)}
                    </span>
                  </>
                )}
              </div>
            </MetadataSection>

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
            onDetailsClick={handleFundDetailsClick}
          />
        </div>
      )}
    </BaseFeedItem>
  );
};
