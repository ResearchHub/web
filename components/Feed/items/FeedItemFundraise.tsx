'use client';

import { FC } from 'react';
import { FeedPostEntry, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import Link from 'next/link';
import { truncateText } from '@/utils/stringUtils';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';

interface FeedItemFundraiseProps {
  entry: FeedEntry;
}

/**
 * Component for rendering the body content of a fundraise feed item
 */
const FeedItemFundraiseBody: FC<{
  entry: FeedEntry;
}> = ({ entry }) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostEntry;

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
      <div className="flex flex-wrap gap-2 mb-3">
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
const extractContributors = (fundraise: FeedPostEntry['fundraise']) => {
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
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({ entry }) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostEntry;

  // Check if this is a preregistration with fundraise data
  const hasFundraise = post.contentType === 'PREREGISTRATION' && post.fundraise;

  // Get the author from the post
  const author = post.createdBy;

  // Convert USD amount to RSC for the header
  const goalAmountRSC = hasFundraise ? post.fundraise!.goalAmount.rsc : 0;

  // Extract contributors if this is a preregistration with fundraise data
  const contributors = hasFundraise ? extractContributors(post.fundraise) : [];
  const hasContributors = contributors.length > 0;

  // Create the funding page URL
  const fundingPageUrl = `/fund/${post.id}/${post.slug}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        contentType="post"
        timestamp={post.createdDate}
        author={author}
        actionText={
          hasFundraise
            ? `published a funding request for ${goalAmountRSC.toLocaleString()} RSC`
            : 'published a post'
        }
      />

      {/* Main Content Card - Wrapped with Link */}
      <Link href={fundingPageUrl} prefetch={false} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div className="p-4">
            {/* Content area with image */}
            <div className="flex mb-4">
              {/* Left side content */}
              <div className="flex-1 pr-4">
                {/* Body Content */}
                <FeedItemFundraiseBody entry={entry} />

                {/* Fundraise Progress (only for preregistrations with fundraise) */}
                {hasFundraise && post.fundraise && (
                  <div className="mt-4">
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
              <div className="flex gap-2 items-center">
                {/* Standard Feed Item Actions */}
                <FeedItemActions
                  metrics={post.metrics}
                  content={post}
                  feedContentType={post.contentType}
                  votableEntityId={post.id}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
