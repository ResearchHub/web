'use client';

import { FC } from 'react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { AuthorList } from '@/components/ui/AuthorList';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import Image from 'next/image';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import Icon from '@/components/ui/icons/Icon';

interface FundingCarouselItemProps {
  entry: FeedEntry;
}

export const FundingCarouselItem: FC<FundingCarouselItemProps> = ({ entry }) => {
  const router = useRouter();
  const post = entry.content as FeedPostContent;
  const fundraise = post.fundraise;

  if (!fundraise) {
    // Should not happen if we fetch correctly, but good safeguard
    return null;
  }

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      profileUrl: author.profileUrl,
    })) || [];

  // Limit the number of authors displayed
  const MAX_AUTHORS_TO_SHOW = 2;
  const displayedAuthors = authors.slice(0, MAX_AUTHORS_TO_SHOW);

  const fundingPageUrl = `/fund/${post.id}/${post.slug}`;
  const imageUrl = post.previewImage;
  const topics = post.topics || []; // Get topics (no type needed if just accessing name)

  const handleCardClick = () => {
    router.push(fundingPageUrl);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'flex-shrink-0 w-[250px] h-[210px] bg-white rounded-lg border border-gray-200 p-3 flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all rounded-br-md duration-200'
      )}
    >
      {/* Topic Badges - Simplified rendering like FeedItemFundraise */}
      {topics.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 mb-1.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
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
      )}

      {/* Use flex row for top content if image exists */}
      <div className={cn('flex-grow flex min-h-0', imageUrl ? 'flex-row gap-3' : 'flex-col')}>
        {/* Image container (if image exists) */}
        {imageUrl && (
          <div className="flex-shrink-0 w-[60px] h-[60px] relative rounded overflow-hidden self-start">
            {' '}
            {/* Reduced size from 80px to 60px */}
            <Image
              src={imageUrl}
              alt={post.title || 'Fundraise image'}
              fill
              className="object-cover"
              sizes="60px"
            />
          </div>
        )}

        {/* Text content (title, authors) */}
        <div className="flex-grow flex flex-col min-w-0">
          {' '}
          {/* Allow text content to grow and wrap */}
          {/* Title - Clamp to 3 lines (reduced from 4) */}
          <h3 className="text-sm font-medium text-gray-800 mb-1.5 line-clamp-3 hover:text-blue-600 flex-shrink-0">
            {post.title}
          </h3>
          {/* Authors list below title */}
          {authors.length > 0 && (
            <div className="mt-0.5 mb-2">
              <AuthorList
                authors={displayedAuthors}
                size="xs" // Smaller size for carousel
                className="text-gray-500 font-normal"
                delimiter="•"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fundraise Progress */}
      <div className="mt-auto pt-2 flex-shrink-0">
        <FundraiseProgress
          fundraise={fundraise}
          compact={true} // Use compact mode
          className="p-0 border-0 bg-transparent text-xs" // Minimal styling
          showPercentage={true} // Show percentage instead of amounts
        />
      </div>
    </div>
  );
};
