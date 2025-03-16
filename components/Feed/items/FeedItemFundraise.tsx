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

interface FeedItemFundraiseProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
}

/**
 * Component for rendering the body content of a fundraise feed item
 */
const FeedItemFundraiseBody: FC<{
  entry: FeedEntry;
}> = ({ entry }) => {
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
    <div className="mb-4">
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
        <ContentTypeBadge type="funding" />
        {topics.map((topic, index) => (
          <div key={index} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {topic.name}
          </div>
        ))}
      </div>

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
    profile: {
      profileImage: contributor.profileImage,
      fullName: contributor.fullName,
    },
    amount: 0, // We don't have individual contribution amounts in the current data model
  }));
};

/**
 * Main component for rendering a fundraise feed item
 */
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({ entry, href }) => {
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
              <FeedItemFundraiseBody entry={entry} />

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
            </div>

            {/* Right side image - cancer cells microscopic image */}
            <div className="w-1/4 rounded-md overflow-hidden">
              <img
                src="https://media.gettyimages.com/id/480798971/video/microscopic-image-of-human-cancer-cells-melanoma.jpg?s=640x640&k=20&c=FhPQtB4SVMyd10NCmTjpnWVs2JXCyLU4WeUvAthtUZA="
                alt="Microscopic image of cancer cells"
                className="w-full h-full object-cover"
                style={{ minHeight: '200px' }}
              />
            </div>
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2 items-center w-full" onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType={post.contentType}
                votableEntityId={post.id}
                userVote={entry.userVote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
