'use client';

import { FC } from 'react';
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
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Users, BookText } from 'lucide-react';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
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
}) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;

  // Get topics/tags for display
  const topics = paper.topics || [];

  // Determine the badge type based on the paper's status
  const getPaperBadgeType = () => {
    return 'paper' as const;
  };

  // Use provided href or create default paper page URL
  const paperPageUrl = href || `/paper/${paper.id}/${paper.slug}`;

  // Construct the dynamic action text
  const journalName = paper.journal?.name;
  const actionText = journalName ? `published in ${journalName}` : 'published in a journal';

  return (
    <BaseFeedItem
      entry={entry}
      href={paperPageUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={actionText}
      maxLength={maxLength}
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
            <ContentTypeBadge type={getPaperBadgeType()} />
            {topics.map((topic, index) => (
              <TopicAndJournalBadge
                key={index}
                type="topic"
                name={topic.name}
                slug={topic.slug || ''}
                imageUrl={topic.imageUrl}
              />
            ))}
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
                    authorUrl: author.profileUrl,
                  }))}
                  size="sm"
                  className="text-gray-500 font-normal"
                  delimiter="•"
                  showAbbreviatedInMobile={true}
                />
              </div>
            </MetadataSection>

            {/* Journal Link */}
            {paper.journal && paper.journal.name && (
              <MetadataSection>
                <div className="mb-3 text-sm text-gray-500 flex items-center gap-1.5">
                  <BookText className="w-4 h-4 text-gray-500" />
                  <a
                    href={paper.journal.slug ? `/journal/${paper.journal.slug}` : '#'}
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
