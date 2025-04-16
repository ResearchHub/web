'use client';

import { FC } from 'react';
import { FeedPaperContent, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { truncateText } from '@/utils/stringUtils';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { JournalStatusBadge } from '@/components/ui/JournalStatusBadge';
import { FeedItemMetadataSection } from '@/components/Feed/FeedItemMetadataSection';

interface FeedItemPaperProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  showTooltips?: boolean; // Property for controlling tooltips
}

/**
 * Component for rendering the body content of a paper feed item
 */
const FeedItemPaperBody: FC<{
  entry: FeedEntry;
}> = ({ entry }) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;

  // Get topics/tags for display
  const topics = paper.topics || [];

  // Determine the badge type based on the paper's status
  const getPaperBadgeType = () => {
    // Always use 'paper' for the primary badge
    return 'paper' as const;
  };

  // Determine the journal status
  const getJournalStatus = () => {
    return (paper.journal as any)?.status === 'preprint' || paper.workType === 'preprint'
      ? 'in-review'
      : 'published';
  };

  return (
    <div className="mb-4">
      {/* Badges and Topics */}
      <div className="flex flex-wrap gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
        <ContentTypeBadge type={getPaperBadgeType()} />

        {paper.journal && paper.journal.name && (
          <TopicAndJournalBadge
            type="journal"
            name={paper.journal.name}
            slug={paper.journal.slug || ''}
            imageUrl={paper.journal.imageUrl}
          />
        )}
        {topics.map((topic, index) => (
          <TopicAndJournalBadge
            key={index}
            type="topic"
            name={topic.name}
            slug={topic.slug || ''}
            imageUrl={topic.imageUrl}
          />
        ))}

        {/* Status badge - only show for ResearchHub Journal */}
        {paper.journal && paper.journal.name === 'ResearchHub Journal' && (
          <JournalStatusBadge status={getJournalStatus()} />
        )}
      </div>

      {/* Paper Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {paper.title}
      </h2>

      {/* Authors */}
      <div className="mb-3">
        <AuthorList
          authors={paper.authors.map((author) => ({
            name: author.fullName,
            verified: author.user?.isVerified,
            profileUrl: author.profileUrl,
          }))}
          size="xs"
          className="text-gray-600 font-normal"
          delimiter="•"
        />
      </div>

      {/* Truncated Content */}
      <div className="text-sm text-gray-700 mb-4">
        <p>{truncateText(paper.textPreview, 300)}</p>
      </div>

      {/* Bounties and Reviews Section */}
      <FeedItemMetadataSection
        id={paper.id}
        slug={paper.slug}
        bounties={paper.bounties}
        reviews={paper.reviews}
        contentType="paper"
      />
    </div>
  );
};

/**
 * Main component for rendering a paper feed item
 */
export const FeedItemPaper: FC<FeedItemPaperProps> = ({ entry, href, showTooltips = true }) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperContent;
  const router = useRouter();

  // Get the author from the paper
  const author = paper.createdBy || paper.authors[0];

  // Use provided href or create default paper page URL
  const paperPageUrl = href || `/paper/${paper.id}/${paper.slug}`;

  // Handle click on the card (navigate to paper page) - only if href is provided
  const handleCardClick = () => {
    if (href) {
      router.push(paperPageUrl);
    }
  };

  // Determine if card should have clickable styles
  const isClickable = !!href;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={paper.createdDate}
        author={author}
        actionText="Published a paper"
      />

      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-4">
          {/* Content area with image */}
          <div className="flex mb-4">
            {/* Left side content */}
            <div className="flex-1 pr-4">
              {/* Body Content */}
              <FeedItemPaperBody entry={entry} />
            </div>

            {/* Right side image - if available */}
            {paper.journal && paper.journal.imageUrl && (
              <div className="w-1/4 rounded-md overflow-hidden">
                <img
                  src={paper.journal.imageUrl}
                  alt={paper.journal.name || 'Journal cover'}
                  className="w-full h-full object-cover"
                  style={{ minHeight: '120px', maxHeight: '200px' }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType="PAPER"
                votableEntityId={paper.id}
                userVote={entry.userVote}
                showTooltips={showTooltips}
                href={paperPageUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
