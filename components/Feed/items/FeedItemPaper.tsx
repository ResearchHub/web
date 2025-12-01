'use client';

import { FC } from 'react';
import { FeedPaperContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
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
          <FeedItemMenuButton
            feedContentType={feedContentType}
            votableEntityId={votableEntityId}
            relatedDocumentId={relatedDocumentId}
            relatedDocumentContentType={relatedDocumentContentType}
          />
        }
        leftContent={
          <FeedItemBadges
            journal={paper.journal}
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

            {/* Authors */}
            {paper.authors.length > 0 && (
              <MetadataSection>
                <div className="flex items-start gap-1.5">
                  <AuthorList
                    authors={paper.authors.map((author) => ({
                      name: author.fullName,
                      verified: author.user?.isVerified,
                      authorUrl: author.id === 0 ? undefined : author.profileUrl,
                    }))}
                    size="sm"
                    className="text-gray-500 font-normal"
                    delimiter="•"
                    showAbbreviatedInMobile={true}
                    hideExpandButton={true}
                    timestamp={paper.createdDate ? formatTimestamp(paper.createdDate) : undefined}
                  />
                </div>
              </MetadataSection>
            )}
            {/* Truncated Content */}
            <ContentSection
              content={paper.textPreview}
              highlightedContent={highlightedSnippet}
              maxLength={maxLength}
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
