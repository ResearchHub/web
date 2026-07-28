'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import {
  BaseFeedItem,
  ImageSection,
  MetadataSection,
  TitleSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemEyebrow } from '@/components/Feed/FeedItemEyebrow';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { buildJournalV2FeedItemViewModel } from '@/components/Journal/lib/journalV2FeedItem';
import { formatTimestamp } from '@/utils/date';

interface FeedItemRegisteredReportProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  maxLength?: number;
  showBountyInfo?: boolean;
  onFeedItemClick?: () => void;
}

export const FeedItemRegisteredReport: FC<FeedItemRegisteredReportProps> = ({
  entry,
  href,
  showTooltips = true,
  maxLength,
  showBountyInfo,
  onFeedItemClick,
}) => {
  const viewModel = buildJournalV2FeedItemViewModel(entry);
  if (!viewModel) return null;

  const post = entry.content as FeedPostContent;
  const reportUrl = href ?? viewModel.href;
  const imageUrl = viewModel.imageUrl;
  const primaryAuthor = post.authors?.[0];
  const coAuthors = (post.authors ?? []).slice(1);
  const reviewSummary = viewModel.reviewSummary;
  const affiliation = post.fundraise?.nonprofit?.name ?? post.institution;

  return (
    <BaseFeedItem
      entry={entry}
      href={reportUrl}
      showActions={false}
      showTooltips={showTooltips}
      showHeader={false}
      maxLength={maxLength}
      showBountyInfo={showBountyInfo}
      onFeedItemClick={onFeedItemClick}
      cardImageLeft={
        imageUrl ? (
          <ImageSection
            imageUrl={imageUrl}
            fullSizeImageUrl={imageUrl}
            alt={post.title || 'Registered report image'}
            naturalDimensions
            previewOnClick={false}
            className="transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : undefined
      }
    >
      {imageUrl && (
        <div className="md:!hidden w-[calc(100%+2rem)] mb-5 -mx-4 -mt-4 overflow-hidden">
          <ImageSection
            imageUrl={imageUrl}
            fullSizeImageUrl={imageUrl}
            alt={post.title || 'Registered report image'}
            aspectRatio="16/9"
            previewOnClick={true}
          />
        </div>
      )}

      <FeedItemEyebrow label="Registered Report" />

      <TitleSection
        title={post.title}
        href={reportUrl}
        onClick={onFeedItemClick}
        className="text-md md:!text-md"
      />

      <MetadataSection className="mt-2 mb-1">
        <div
          className="flex items-center gap-2.5 cursor-default"
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {primaryAuthor && (
            <AuthorTooltip authorId={primaryAuthor.id !== 0 ? primaryAuthor.id : undefined}>
              <Avatar
                src={primaryAuthor.profileImage || undefined}
                alt={primaryAuthor.fullName}
                size={affiliation ? 'md' : 'sm'}
                disableTooltip
              />
            </AuthorTooltip>
          )}

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center flex-wrap gap-y-1 text-base">
              {primaryAuthor && (
                <span className="flex min-w-0 items-center gap-2">
                  <Link
                    href={primaryAuthor.profileUrl || '#'}
                    className="truncate text-sm font-medium text-gray-900 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {primaryAuthor.fullName}
                  </Link>
                  {coAuthors.length > 0 && (
                    <AvatarStack
                      items={coAuthors.map((author) => ({
                        src: author.profileImage || '',
                        alt: author.fullName,
                        tooltip: author.fullName,
                        authorId: author.id || undefined,
                      }))}
                      size="xxs"
                      maxItems={3}
                      spacing={-6}
                      showLabel={false}
                      showExtraCount
                      totalItemsCount={coAuthors.length}
                      extraCountLabel="Authors"
                    />
                  )}
                </span>
              )}
              {entry.timestamp && (
                <>
                  {primaryAuthor && <span className="mx-2 text-gray-500">•</span>}
                  <span className="text-gray-600 whitespace-nowrap text-sm">
                    {formatTimestamp(entry.timestamp, false)}
                  </span>
                </>
              )}
              {reviewSummary && (
                <>
                  {(primaryAuthor || entry.timestamp) && (
                    <span className="mx-2 text-gray-500">•</span>
                  )}
                  <Tooltip
                    content={
                      <PeerReviewTooltip
                        reviews={reviewSummary.reviews}
                        averageScore={reviewSummary.average}
                        href={viewModel.proposalHref ?? reportUrl}
                      />
                    }
                    position="top"
                    width="w-[320px]"
                  >
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 cursor-help">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {reviewSummary.average.toFixed(1)}
                    </span>
                  </Tooltip>
                </>
              )}
            </div>

            {affiliation && <span className="truncate text-sm text-gray-500">{affiliation}</span>}
          </div>
        </div>
      </MetadataSection>
    </BaseFeedItem>
  );
};
