'use client';

import { FC } from 'react';
import { FeedPaperContent, FeedEntry } from '@/types/feed';
import { Bounty, BountyContribution } from '@/types/bounty';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { truncateText } from '@/utils/stringUtils';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';
import { JournalStatusBadge } from '@/components/ui/JournalStatusBadge';
import { formatRSC } from '@/utils/number';
import { AvatarStack } from '@/components/ui/AvatarStack';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';

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

      {/* --- Condensed Bounty Info --- */}
      {paper.bounties &&
        paper.bounties.filter((b: Bounty) => b.status === 'OPEN').length > 0 &&
        (() => {
          const firstOpenBounty = paper.bounties!.find((b: Bounty) => b.status === 'OPEN');
          const amountAsNumber = parseFloat(firstOpenBounty?.totalAmount || '0');
          const formattedAmount = formatRSC({ amount: amountAsNumber, shorten: true });
          const creatorProfile = firstOpenBounty?.createdBy?.authorProfile;

          // Get contributors and prepare items for AvatarStack
          const contributors = firstOpenBounty?.contributions || [];
          const contributorItems = contributors.map((c: BountyContribution) => ({
            src: c.createdBy.authorProfile?.profileImage || '',
            alt: c.createdBy.authorProfile?.fullName || 'Contributor',
            authorId: c.createdBy.authorProfile?.id,
          }));

          return (
            <Link
              href={`/paper/${paper.id}/${paper.slug}?tab=bounties`}
              onClick={(e) => e.stopPropagation()} // Prevent card click propagation
              className="block mt-3" // Removed border and other styles from Link
            >
              {/* New container with background and padding */}
              <div className="flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 p-3 rounded-lg transition-colors duration-150">
                {/* Left side: Icon, Amount, Text */}
                <div className="flex items-center space-x-2">
                  <Icon name="RSC" className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-orange-800 font-medium">{formattedAmount} RSC</span>
                  <span className="text-sm text-gray-600">to peer review</span>
                </div>

                {/* Right side: AvatarStack or Creator Avatar */}
                {contributorItems.length > 0 ? (
                  <AvatarStack
                    items={contributorItems}
                    size="xs"
                    maxItems={3} // Show max 3 contributors initially
                    spacing={-6} // Adjust overlap
                    showExtraCount={true} // Show +N if more than maxItems
                  />
                ) : creatorProfile ? (
                  // Fallback to creator avatar if no contributors
                  <Avatar
                    src={creatorProfile.profileImage || ''}
                    alt={creatorProfile.fullName || 'Creator'}
                    size="xs"
                    authorId={creatorProfile.id}
                  />
                ) : null}
              </div>
            </Link>
          );
        })()}
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
