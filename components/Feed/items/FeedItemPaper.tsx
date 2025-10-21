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
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Users, BookText } from 'lucide-react';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  feedView?: string;
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
  feedView,
}) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;

  // Get topics/tags for display
  const topics = paper.topics || [];

  // Check if we're on the following feed
  const isFollowingFeed = feedView === 'following';

  // Determine the badge type based on the paper's status
  const getPaperBadgeType = () => {
    return 'paper' as const;
  };

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
  const journalLogo = paper.journal?.name ? getSourceLogo(paper.journal.name) : null;

  return (
    <BaseFeedItem
      entry={entry}
      href={paperPageUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={actionText}
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
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
            {isFollowingFeed ? (
              <>
                {/* Journal Badge - Only on following feed */}
                {paper.journal && paper.journal.slug && (
                  <Link href={`/topic/${paper.journal.slug}`}>
                    <Badge
                      variant="default"
                      className="text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer px-2 py-1 h-[26px]"
                    >
                      {journalLogo ? (
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
                {/* Category Badge - Only on following feed */}
                {paper.category && paper.category.slug && (
                  <Link href={`/topic/${paper.category.slug}`}>
                    <Badge
                      variant="default"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer font-medium px-2 py-1"
                    >
                      {paper.category.name}
                    </Badge>
                  </Link>
                )}
                {/* Subcategory Badge - Only on following feed */}
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
                {/* Default badges for non-following feeds */}
                <ContentTypeBadge type={getPaperBadgeType()} />
                {topics.map((topic) => (
                  <TopicAndJournalBadge
                    key={topic.id || topic.slug}
                    type="topic"
                    name={topic.name}
                    slug={topic.slug}
                    imageUrl={topic.imageUrl}
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
            <TitleSection title={paper.title} />

            {/* Authors */}
            <MetadataSection>
              <div className="mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-500" />
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
                />
              </div>
            </MetadataSection>

            {/* Journal Link - Hide on following feed */}
            {!isFollowingFeed && paper.journal && paper.journal.name && (
              <MetadataSection>
                <div className="mb-3 text-sm text-gray-500 flex items-center gap-1.5">
                  <BookText className="w-4 h-4 text-gray-500" />
                  <a
                    href={paper.journal.slug ? `/topic/${paper.journal.slug}` : '#'}
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {paper.journal.name}
                  </a>
                </div>
              </MetadataSection>
            )}
            {/* Truncated Content */}
            <ContentSection content={paper.textPreview} maxLength={maxLength} />
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
