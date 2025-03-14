'use client';

import { FC } from 'react';
import { FeedPaperEntry, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import Link from 'next/link';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { truncateText } from '@/utils/stringUtils';

interface FeedItemPaperProps {
  entry: FeedEntry;
}

/**
 * Component for rendering the body content of a paper feed item
 */
const FeedItemPaperBody: FC<{
  entry: FeedEntry;
}> = ({ entry }) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperEntry;

  // Get topics/tags for display
  const topics = paper.topics || [];

  return (
    <div className="mb-4">
      {/* Badges and Topics */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ContentTypeBadge type="paper" />
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
      <div className="text-sm text-gray-700">
        <p>{truncateText(paper.textPreview, 300)}</p>
      </div>
    </div>
  );
};

/**
 * Main component for rendering a paper feed item
 */
export const FeedItemPaper: FC<FeedItemPaperProps> = ({ entry }) => {
  // Extract the paper from the entry's content
  const paper = entry.content as FeedPaperEntry;

  // Get the author from the paper
  const author = paper.createdBy;

  // Create the paper page URL
  const paperPageUrl = `/paper/${paper.id}/${paper.slug}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        contentType="paper"
        timestamp={paper.createdDate}
        author={author}
        actionText="published a paper"
      />

      {/* Main Content Card - Wrapped with Link */}
      <Link href={paperPageUrl} prefetch={false} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all duration-200">
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
              <div className="flex gap-2 items-center">
                {/* Standard Feed Item Actions */}
                <FeedItemActions
                  metrics={paper.metrics}
                  content={paper}
                  feedContentType="PAPER"
                  votableEntityId={paper.id}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
