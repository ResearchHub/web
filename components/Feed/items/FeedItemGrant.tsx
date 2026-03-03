'use client';

import { FC } from 'react';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { FeedItemBadges } from '@/components/Feed/FeedItemBadges';
import { GrantInfo } from '@/components/Fund/GrantInfo';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Star } from 'lucide-react';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { formatTimestamp } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';

interface FeedItemGrantRefactoredProps {
  entry: FeedEntry;
  href?: string;
  className?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  customActionText?: string;
  maxLength?: number;
  showHeader?: boolean;
  onFeedItemClick?: () => void;
  onAbstractExpanded?: () => void;
  highlights?: Highlight[];
}

/**
 * Refactored Grant Feed Item using BaseFeedItem
 */
export const FeedItemGrant: FC<FeedItemGrantRefactoredProps> = ({
  entry,
  href,
  className,
  showActions = true,
  showTooltips = true,
  customActionText,
  maxLength,
  showHeader = true,
  onFeedItemClick,
  onAbstractExpanded,
  highlights,
}) => {
  const grant = entry.content as FeedGrantContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Use provided href or create default grant page URL
  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const grantPageUrl =
    href ||
    buildWorkUrl({
      id: grant.id,
      slug: grant.slug,
      contentType: 'funding_request',
    });

  return (
    <BaseFeedItem
      entry={entry}
      href={grantPageUrl}
      className={className}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={customActionText ?? 'opened an RFP'}
      maxLength={maxLength}
      showHeader={showHeader}
      onFeedItemClick={onFeedItemClick}
      hideReportButton={true}
    >
      {/* Top section with status + image(mobile) */}
      <FeedItemTopSection
        imageSection={
          grant.previewImage && (
            <ImageSection
              imageUrl={grant.previewImage}
              alt={grant.title || 'Grant image'}
              aspectRatio="16/9"
            />
          )
        }
        rightContent={null}
        leftContent={null}
      />

      <div className="mt-[-7px]">
        <FeedItemBadges
          topics={grant.topics}
          category={grant.category}
          subcategory={grant.subcategory}
        />
      </div>

      {/* Main content layout + image(desktop) */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection
              title={grant.title}
              highlightedTitle={highlightedTitle}
              href={grantPageUrl}
              onClick={onFeedItemClick}
            />

            {/* Organization or Authors list */}
            <MetadataSection className="mb-1">
              <div className="flex items-center flex-wrap text-base">
                {grant.organization || grant.grant?.organization ? (
                  <span className="text-gray-500 font-normal text-sm">
                    {grant.organization || grant.grant?.organization}
                  </span>
                ) : (
                  grant.authors.length > 0 && (
                    <AuthorList
                      authors={grant.authors.map((author) => ({
                        name: author.fullName,
                        verified: author.user?.isVerified,
                        authorUrl: author.id === 0 ? undefined : author.profileUrl,
                      }))}
                      size="base"
                      className="text-gray-500 font-normal text-sm"
                      delimiter=","
                      delimiterClassName="ml-0"
                      showAbbreviatedInMobile={true}
                      hideExpandButton={true}
                    />
                  )
                )}
                {grant.createdDate && (
                  <>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-600 whitespace-nowrap text-sm">
                      {formatTimestamp(grant.createdDate, false)}
                    </span>
                  </>
                )}
                {hasReviewScore && (
                  <>
                    <span className="mx-2 text-gray-500">•</span>
                    <Tooltip
                      content={
                        <PeerReviewTooltip
                          reviews={grant.reviews ?? []}
                          averageScore={reviewScore}
                          href={grantPageUrl}
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

            {/* Description Section - handles both desktop and mobile */}
            {(grant.grant?.description || grant.textPreview) && (
              <FeedItemAbstractSection
                content={grant.grant?.description || grant.textPreview || ''}
                highlightedContent={highlightedSnippet}
                maxLength={maxLength}
                mobileLabel="Read description"
                className="mb-3"
                onAbstractExpanded={onAbstractExpanded}
              />
            )}
          </>
        }
        rightContent={
          grant.previewImage && (
            <ImageSection
              imageUrl={grant.previewImage}
              alt={grant.title || 'Grant image'}
              aspectRatio="4/3"
            />
          )
        }
      />
      {/* Grant Info */}
      <div
        className="mt-4"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <GrantInfo grant={grant} onFeedItemClick={onFeedItemClick} />
      </div>
    </BaseFeedItem>
  );
};
