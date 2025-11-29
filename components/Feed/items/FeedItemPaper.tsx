'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedPaperContent, FeedEntry } from '@/types/feed';
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
import { Badge } from '@/components/ui/Badge';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Users } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { formatTimestamp } from '@/utils/date';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  showBountyInfoSummary?: boolean;
  highlights?: Highlight[];
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
  showBountyInfoSummary = true,
  highlights,
}) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Get topics/tags for display
  const topics = (paper.topics || []).filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

  // Helper function to get source logo
  const getSourceLogo = (source: string) => {
    const sourceLower = source.toLowerCase();
    switch (sourceLower) {
      case 'arxiv':
        return '/logos/arxiv.png';
      case 'biorxiv':
        return '/logos/biorxiv.png';
      case 'chemrxiv':
        return '/logos/chemrxiv.png';
      case 'medrxiv':
        return '/logos/medrxiv.jpg';
      case 'researchhub-journal':
        return 'rhJournal2';
      default:
        return null;
    }
  };

  // Use provided href or create default paper page URL
  const paperPageUrl = href || `/paper/${paper.id}/${paper.slug}`;

  // Construct the dynamic action text
  const journalName = paper.journal?.name;
  const actionText = journalName ? `published in ${journalName}` : 'published in a journal';

  // Get journal logo if available
  const journalLogo = paper.journal?.name ? getSourceLogo(paper.journal.slug) : null;

  const isRHJournal = journalLogo === 'rhJournal2';

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
      showBountyInfoSummary={showBountyInfoSummary}
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
        leftContent={
          <>
            {journalLogo ? (
              <>
                {/* Journal Badge - On following and for-you feeds */}
                {paper.journal && paper.journal.slug && (
                  <Link href={`/topic/${paper.journal.slug}`}>
                    <Badge
                      variant="default"
                      className="text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer px-2 py-1 h-[26px]"
                    >
                      {isRHJournal ? (
                        <>
                          <Icon name="rhJournal2" size={14} className="mr-2" />
                          <span className="text-gray-700">RH Journal</span>
                        </>
                      ) : journalLogo ? (
                        <Image
                          src={journalLogo}
                          alt={paper.journal.name}
                          width={50}
                          height={14}
                          className="object-contain"
                          style={{ maxHeight: '14px' }}
                        />
                      ) : (
                        <span className="text-gray-700">{paper.journal.name}</span>
                      )}
                    </Badge>
                  </Link>
                )}
                {/* Category Badge - On following and for-you feeds */}
                {paper.category && paper.category.slug && (
                  <Link href={`/topic/${paper.category.slug}`}>
                    <Badge
                      variant="default"
                      className="text-xs text-gray-700 hover:bg-gray-200 cursor-pointer px-2 py-1"
                    >
                      {paper.category.name}
                    </Badge>
                  </Link>
                )}
                {/* Subcategory Badge - On following and for-you feeds */}
                {paper.subcategory && paper.subcategory.slug && (
                  <Link href={`/topic/${paper.subcategory.slug}`}>
                    <Badge
                      variant="default"
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer px-2 py-1"
                    >
                      {paper.subcategory.name}
                    </Badge>
                  </Link>
                )}
              </>
            ) : (
              <>
                <ContentTypeBadge type="paper" />
                {topics.map((topic) => (
                  <TopicAndJournalBadge
                    key={topic.id || topic.slug}
                    name={topic.name}
                    slug={topic.slug}
                  />
                ))}
              </>
            )}
          </>
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
                  <Users className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
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
