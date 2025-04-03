'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { truncateText } from '@/utils/stringUtils';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import Image from 'next/image';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

interface FeedItemFundraiseProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  showTooltips?: boolean; // Property for controlling tooltips
}

/**
 * Component for rendering the body content of a fundraise feed item
 */
const FeedItemFundraiseBody: FC<{
  entry: FeedEntry;
  imageUrl?: string;
}> = ({ entry, imageUrl }) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Get topics/tags for display
  const topics = post.topics || [];

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      profileUrl: author.profileUrl,
    })) || [];

  return (
    <div>
      {/* Badges - Always at the top */}
      <div className="flex flex-wrap gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
        <ContentTypeBadge type="funding" />
        {topics.map((topic, index) => (
          <TopicAndJournalBadge
            key={index}
            type="topic"
            name={topic.name}
            slug={topic.slug || topic.name.toLowerCase().replace(/\s+/g, '-')}
            imageUrl={topic.imageUrl}
          />
        ))}
      </div>

      {/* Content area with image */}
      <div className="flex justify-between items-start gap-4">
        {/* Left side content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {/* Authors list below title */}
          {authors.length > 0 && (
            <div className="mt-1 mb-3">
              <AuthorList
                authors={authors}
                size="sm"
                className="text-gray-600 font-normal"
                delimiter="•"
              />
            </div>
          )}

          {/* Truncated Content */}
          <div className="text-sm text-gray-700">
            <p>{truncateText(post.textPreview)}</p>
          </div>
        </div>

        {/* Image - Positioned to the right, aligned with title */}
        {imageUrl && (
          <div className="flex-shrink-0 w-[280px] max-w-[33%] hidden md:block">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden shadow-sm">
              <Image
                src={imageUrl}
                alt={post.title || 'Fundraise image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Helper function to extract contributors from fundraise data
 */
const extractContributors = (fundraise: FeedPostContent['fundraise']) => {
  if (!fundraise || !fundraise.contributors || !fundraise.contributors.topContributors) {
    return [];
  }

  return fundraise.contributors.topContributors.map((contributor) => ({
    profileImage: contributor.authorProfile.profileImage,
    fullName: contributor.authorProfile.fullName,
    profileUrl: contributor.authorProfile.profileUrl,
  }));
};

/**
 * Main component for rendering a fundraise feed item
 */
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({
  entry,
  href,
  showTooltips = true,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;
  const router = useRouter();

  // Check if this is a preregistration with fundraise data
  const hasFundraise = post.contentType === 'PREREGISTRATION' && post.fundraise;

  // Get the author from the post
  const author = post.createdBy;

  // Convert USD amount to RSC for the header
  const goalAmountRSC = hasFundraise ? post.fundraise!.goalAmount.rsc : 0;

  // Extract contributors if this is a preregistration with fundraise data
  const contributors = hasFundraise ? extractContributors(post.fundraise) : [];
  const hasContributors = contributors.length > 0;

  // Use provided href or create default funding page URL
  const fundingPageUrl = href || `/fund/${post.id}/${post.slug}`;

  // Handle click on the card (navigate to funding page) - only if href is provided
  const handleCardClick = () => {
    if (href) {
      router.push(fundingPageUrl);
    }
  };

  // Determine if card should have clickable styles
  const isClickable = !!href;

  // Image URL
  const imageUrl = post.previewImage || undefined; // Only use the actual preview image, no default

  // Mobile image display (for small screens only)
  const MobileImage = () =>
    imageUrl ? (
      <div className="md:hidden w-full mb-4">
        <div className="aspect-[16/9] relative rounded-lg overflow-hidden shadow-sm">
          <Image
            src={imageUrl}
            alt={post.title || 'Fundraise image'}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={post.createdDate}
        author={author}
        actionText={
          hasFundraise
            ? `published a funding request for ${goalAmountRSC.toLocaleString()} RSC`
            : 'published a post'
        }
        contributors={hasFundraise ? extractContributors(post.fundraise) : []}
        contributorsLabel="Funding Contributors"
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
          {/* Mobile image (shown only on small screens) */}
          <MobileImage />

          {/* Body Content with desktop image integrated */}
          <FeedItemFundraiseBody entry={entry} imageUrl={imageUrl} />

          {/* Fundraise Progress (only for preregistrations with fundraise) */}
          {hasFundraise && post.fundraise && (
            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
              <FundraiseProgress
                fundraise={post.fundraise}
                compact={true}
                showContribute={false}
                className="p-0 border-0 bg-transparent"
              />
            </div>
          )}

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType={post.contentType}
                votableEntityId={post.id}
                userVote={entry.userVote}
                showTooltips={showTooltips}
                href={fundingPageUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
