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
  compact?: boolean; // Add compact prop
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
  compact = false, // Initialize compact prop
}) => {
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.has('debug');
  ...
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
      compact={compact}
    >
      {/* Top section with badges and mobile image (hide PDF previews on mobile) */}
      <FeedItemTopSection
        imageSection={
          thumbnailUrl &&
          !isPdfPreview &&
          !compact && ( // Hide image in compact mode
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
        ...
      />
      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection
              title={paper.title}
              highlightedTitle={highlightedTitle}
              href={paperPageUrl}
              onClick={onFeedItemClick}
              className={cn(compact && 'text-sm md:!text-base mb-0')} // Smaller title in compact mode
            />

            {/* Authors and Date */}
            <MetadataSection className={cn('mb-1', compact && 'mb-0')}>
              <div className="flex items-center flex-wrap text-base">
                {paper.authors.length > 0 && (
                  <AuthorList
                    authors={paper.authors.map((author) => ({
                      name: author.fullName,
                      verified: author.user?.isVerified,
                      authorUrl: author.id === 0 ? undefined : author.profileUrl,
                    }))}
                    size="base"
                    className={cn('text-gray-500 font-normal text-sm', compact && 'text-xs')}
                    delimiter=","
                    delimiterClassName="ml-0"
                    showAbbreviatedInMobile={true}
                    hideExpandButton={true}
                  />
                )}
                {(entry.timestamp || paper.createdDate) && (
                  <>
                    {paper.authors.length > 0 && <span className="mx-2 text-gray-500">•</span>}
                    <span className={cn('text-gray-600 whitespace-nowrap text-sm', compact && 'text-xs')}>
                      {formatTimestamp(entry.timestamp || paper.createdDate, false)}
                    </span>
                  </>
                )}
              </div>
            </MetadataSection>

            {!compact && ( // Hide abstract in compact mode
              <FeedItemAbstractSection
                content={paper.textPreview}
                highlightedContent={highlightedSnippet}
                maxLength={maxLength}
                className="mt-3"
                onAbstractExpanded={onAbstractExpanded}
              />
            )}
          </>
        }
        rightContent={
          thumbnailUrl &&
          !compact && ( // Hide image in compact mode
            <ImageSection
              imageUrl={thumbnailUrl}
              alt={paper.title || 'Paper image'}
              naturalDimensions={true}
            />
          )
        }
      />
    </BaseFeedItem>
  );
};
