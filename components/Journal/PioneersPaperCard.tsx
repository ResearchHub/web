'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { FeedEntry, FeedPaperContent } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { formatTimestamp } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';

interface PioneersPaperCardProps {
  entry: FeedEntry;
}

/**
 * One paper on the Pioneers page. The feed no longer shows papers, so the
 * page renders its own card for the journal's earlier publications.
 */
export const PioneersPaperCard: FC<PioneersPaperCardProps> = ({ entry }) => {
  const paper = entry.content as FeedPaperContent;
  const href = buildWorkUrl({ id: paper.id, slug: paper.slug, contentType: 'paper' });

  const thumbnailUrl = paper.previewThumbnail || paper.journal?.imageUrl;
  const isPdfPreview = thumbnailUrl?.includes('preview');

  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  return (
    <BaseFeedItem
      entry={entry}
      href={href}
      showHeader={false}
      customActionText="published in ResearchHub Journal"
      hideReportButton={false}
      cardImage={
        thumbnailUrl ? (
          <ImageSection
            imageUrl={thumbnailUrl}
            fullSizeImageUrl={paper.previewImage}
            alt={paper.title || 'Paper image'}
            naturalDimensions={true}
            previewOnClick={!!paper.previewImage}
          />
        ) : undefined
      }
    >
      <FeedItemTopSection
        imageSection={
          thumbnailUrl &&
          !isPdfPreview && (
            <ImageSection
              imageUrl={thumbnailUrl}
              fullSizeImageUrl={paper.previewImage}
              alt={paper.title || 'Paper image'}
              aspectRatio="16/9"
              showFullImage={true}
              expandToFit={true}
              previewOnClick={!!paper.previewImage}
              className="max-h-[180px] mx-auto"
            />
          )
        }
        leftContent={null}
      />

      <TitleSection title={paper.title} href={href} />

      <MetadataSection className="mb-1">
        <div className="flex items-center flex-wrap text-base">
          {paper.authors.length > 0 && (
            <AuthorList
              authors={paper.authors.map((author) => ({
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
          )}
          {(entry.timestamp || paper.createdDate) && (
            <>
              {paper.authors.length > 0 && <span className="mx-2 text-gray-500">•</span>}
              <span className="text-gray-600 whitespace-nowrap text-sm">
                {formatTimestamp(entry.timestamp || paper.createdDate, false)}
              </span>
            </>
          )}
          {hasReviewScore && (
            <>
              <span className="mx-2 text-gray-500">•</span>
              <Tooltip
                content={
                  <PeerReviewTooltip
                    reviews={paper.reviews ?? []}
                    averageScore={reviewScore}
                    href={href}
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

      <FeedItemAbstractSection content={paper.textPreview} className="mt-3" />
    </BaseFeedItem>
  );
};
