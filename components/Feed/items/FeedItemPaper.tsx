'use client';

import { FC } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FeedPaperContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { FeedItemTopicBadges } from '@/components/Feed/FeedItemTopicBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { PopularityScoreTooltip } from '@/components/tooltips/HotScoreTooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Star } from 'lucide-react';
import { formatTimestamp } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { buildWorkUrl } from '@/utils/url';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  onAbstractExpanded?: () => void;
  highlights?: Highlight[];
  showBountyInfo?: boolean;
}

/**
 * Component for rendering a paper feed item using BaseFeedItem
 */
export const FeedItemPaper: FC<FeedItemPaperProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  maxLength,
  onFeedItemClick,
  onAbstractExpanded,
  highlights,
  showBountyInfo,
}) => {
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.has('debug');

  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;
  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Use provided href or create default paper page URL
  const paperPageUrl =
    href ||
    buildWorkUrl({
      id: paper.id,
      slug: paper.slug,
      contentType: 'paper',
    });

  // Construct the dynamic action text
  const journalName = paper.journal?.name;
  const actionText = journalName ? `published in ${journalName}` : 'published in a journal';

  // Only show journal badge for specific preprint servers
  const ALLOWED_JOURNALS = ['biorxiv', 'arxiv', 'medrxiv', 'chemrxiv'];
  const journalSlugLower = paper.journal?.slug?.toLowerCase() || '';
  const shouldShowJournal = ALLOWED_JOURNALS.some((j) => journalSlugLower.includes(j));
  const filteredJournal = shouldShowJournal ? paper.journal : undefined;

  const thumbnailUrl = paper.previewThumbnail || paper.journal?.imageUrl;
  const isPdfPreview = thumbnailUrl?.includes('preview');

  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  return (
    <BaseFeedItem
      entry={entry}
      href={paperPageUrl}
      showActions={showActions}
      showHeader={false}
      showTooltips={showTooltips}
      customActionText={actionText}
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showBountyInfo={showBountyInfo}
      hideReportButton={false}
      cardImage={
        thumbnailUrl ? (
          <ImageSection
            imageUrl={thumbnailUrl}
            alt={paper.title || 'Paper image'}
            naturalDimensions={true}
          />
        ) : undefined
      }
      badges={
        <FeedItemTopicBadges
          journal={filteredJournal}
          category={paper.category}
          subcategory={paper.subcategory}
          topics={paper.topics}
        />
      }
    >
      {/* Top section with mobile image */}
      <FeedItemTopSection
        imageSection={
          thumbnailUrl &&
          !isPdfPreview && (
            <ImageSection
              imageUrl={thumbnailUrl}
              alt={paper.title || 'Paper image'}
              aspectRatio="16/9"
              showFullImage={true}
              expandToFit={true}
              className="max-h-[180px] mx-auto"
            />
          )
        }
        rightContent={
          isDebugMode && entry.hotScoreV2 !== undefined && entry.hotScoreV2 > 0 ? (
            <Tooltip
              content={
                <PopularityScoreTooltip
                  score={entry.hotScoreV2}
                  breakdown={entry.hotScoreBreakdown}
                />
              }
              width="w-72"
              position="bottom"
            >
              <div className="flex items-center gap-1 text-blue-600 cursor-help hover:text-blue-700 transition-colors">
                <Image
                  src="/icons/flaskVector.svg"
                  alt="Popularity Score"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">{Math.round(entry.hotScoreV2)}</span>
              </div>
            </Tooltip>
          ) : null
        }
        leftContent={null}
      />

      <TitleSection
        title={paper.title}
        highlightedTitle={highlightedTitle}
        href={paperPageUrl}
        onClick={onFeedItemClick}
      />

      {/* Authors and Date */}
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
                    href={paperPageUrl}
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

      <FeedItemAbstractSection
        content={paper.textPreview}
        highlightedContent={highlightedSnippet}
        maxLength={maxLength}
        className="mt-3"
        onAbstractExpanded={onAbstractExpanded}
      />
    </BaseFeedItem>
  );
};
