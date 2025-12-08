'use client';

import { FC } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FeedPaperContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
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
import { Tooltip } from '@/components/ui/Tooltip';
import { PopularityScoreTooltip } from '@/components/tooltips/HotScoreTooltip';
import { formatTimestamp } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
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
  const paperPageUrl = href || `/paper/${paper.id}/${paper.slug}`;

  // Construct the dynamic action text
  const journalName = paper.journal?.name;
  const actionText = journalName ? `published in ${journalName}` : 'published in a journal';

  // Extract props for FeedItemMenuButton (same as BaseFeedItem uses for FeedItemActions)
  const feedContentType = paper.contentType || 'PAPER';
  const votableEntityId = paper.id;
  const relatedDocumentId =
    'relatedDocumentId' in paper ? paper.relatedDocumentId?.toString() : paper.id.toString();
  const relatedDocumentContentType = mapFeedContentTypeToContentType(paper.contentType);

  // Only show journal badge for specific preprint servers
  const ALLOWED_JOURNALS = ['biorxiv', 'arxiv', 'medrxiv', 'chemrxiv'];
  const journalSlugLower = paper.journal?.slug?.toLowerCase() || '';
  const shouldShowJournal = ALLOWED_JOURNALS.some((j) => journalSlugLower.includes(j));
  const filteredJournal = shouldShowJournal ? paper.journal : undefined;

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
      hideReportButton={true}
    >
      {/* Top section with badges and mobile image */}
      <FeedItemTopSection
        imageSection={
          paper.journal?.imageUrl && (
            <ImageSection
              imageUrl={paper.journal.imageUrl}
              alt={paper.journal.name || 'Journal cover'}
              aspectRatio="16/9"
            />
          )
        }
        rightContent={
          <div className="flex items-center gap-2">
            {isDebugMode && entry.hotScoreV2 !== undefined && entry.hotScoreV2 > 0 && (
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
            )}
            <FeedItemMenuButton
              feedContentType={feedContentType}
              votableEntityId={votableEntityId}
              relatedDocumentId={relatedDocumentId}
              relatedDocumentContentType={relatedDocumentContentType}
              relatedDocumentUnifiedDocumentId={paper.unifiedDocumentId}
            />
          </div>
        }
        leftContent={
          <FeedItemBadges
            journal={filteredJournal}
            category={paper.category}
            subcategory={paper.subcategory}
            topics={paper.topics}
          />
        }
      />
      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={paper.title} highlightedTitle={highlightedTitle} />

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
                {paper.createdDate && (
                  <>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-600 whitespace-nowrap text-sm">
                      {formatTimestamp(paper.createdDate, false)}
                    </span>
                  </>
                )}
              </div>
            </MetadataSection>

            <FeedItemAbstractSection
              content={paper.textPreview}
              highlightedContent={highlightedSnippet}
              maxLength={maxLength}
              className="mt-3"
            />
          </>
        }
        rightContent={
          paper.journal?.imageUrl && (
            <ImageSection
              imageUrl={paper.journal.imageUrl}
              alt={paper.journal.name || 'Journal cover'}
              aspectRatio="4/3"
            />
          )
        }
      />
    </BaseFeedItem>
  );
};
