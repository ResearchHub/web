'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { truncateText } from '@/utils/stringUtils';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users } from 'lucide-react';

interface FeedItemPostProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  showTooltips?: boolean; // Property for controlling tooltips
  showActions?: boolean; // Property for controlling actions
}

/**
 * Component for rendering the body content of a post feed item
 */
const FeedItemPostBody: FC<{
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
        <ContentTypeBadge type="article" />
        {topics.map((topic, index) => (
          <div key={index} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {topic.name}
          </div>
        ))}
      </div>

      {/* Content area with image */}
      <div className="flex justify-between items-start gap-4">
        {/* Left side content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h2>

          {/* Authors list below title */}
          {authors.length > 0 && (
            <div className="mt-1 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <AuthorList
                authors={authors}
                size="sm"
                className="text-gray-500 font-normal text-sm"
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
                alt={post.title || 'Post image'}
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
 * Main component for rendering a post feed item
 */
export const FeedItemPost: FC<FeedItemPostProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;
  const router = useRouter();

  // Get the author from the post
  const author = post.createdBy;

  // Use provided href or create default post page URL
  const postPageUrl = href || `/post/${post.id}/${post.slug}`;

  // Handle click on the card (navigate to post page) - only if href is provided
  const handleCardClick = () => {
    if (href) {
      router.push(postPageUrl);
    }
  };

  // Determine if card should have clickable styles
  const isClickable = !!href;

  // Use a placeholder image for now since FeedPostContent doesn't have an image property
  const imageUrl = post.previewImage || undefined;

  // Mobile image display (for small screens only)
  const MobileImage = () => {
    if (!imageUrl) return null;

    return (
      <div className="md:hidden w-full mb-4">
        <div className="aspect-[16/9] relative rounded-lg overflow-hidden shadow-sm">
          <Image
            src={imageUrl}
            alt={post.title || 'Post image'}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={post.createdDate}
        author={author}
        actionText="published an article"
      />

      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-4">
          {/* Mobile image (shown only on small screens) */}
          <MobileImage />

          {/* Body Content with desktop image integrated */}
          <FeedItemPostBody entry={entry} imageUrl={imageUrl} />

          {/* Action Buttons - Full width */}
          {showActions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div onClick={(e) => e.stopPropagation()}>
                {/* Standard Feed Item Actions */}
                <FeedItemActions
                  metrics={entry.metrics}
                  feedContentType={post.contentType}
                  votableEntityId={post.id}
                  userVote={entry.userVote}
                  showTooltips={showTooltips}
                  href={postPageUrl}
                  reviews={post.reviews}
                  bounties={post.bounties}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
