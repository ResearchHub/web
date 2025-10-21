'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
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
import { Users } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

interface FeedItemPostProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
}

/**
 * Post Feed Item using BaseFeedItem
 */
export const FeedItemPost: FC<FeedItemPostProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  maxLength,
  onFeedItemClick,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Get topics/tags for display
  const topics = post.topics || [];

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.profileUrl,
    })) || [];

  // Use provided href or create default post page URL
  const postPageUrl = href || `/post/${post.id}/${post.slug}`;

  return (
    <BaseFeedItem
      entry={entry}
      href={postPageUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={post.postType === 'QUESTION' ? 'asked a question' : 'published an article'}
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showPeerReviews={post.postType !== 'QUESTION'}
    >
      {/* Top section with badges and mobile image */}
      <FeedItemTopSection
        imageSection={
          post.previewImage && (
            <ImageSection
              imageUrl={post.previewImage}
              alt={post.title || 'Post image'}
              aspectRatio="16/9"
            />
          )
        }
        leftContent={
          <>
            <ContentTypeBadge type={post.postType === 'QUESTION' ? 'question' : 'preprint'} />
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
        }
      />
      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={post.title} />

            {/* Authors list below title */}
            {authors.length > 0 && (
              <MetadataSection>
                <div className="mt-1 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <AuthorList
                    authors={authors}
                    size="sm"
                    className="text-gray-500 font-normal text-sm"
                    delimiter="•"
                  />
                </div>
              </MetadataSection>
            )}

            {/* Truncated Content */}
            <ContentSection content={post.textPreview} maxLength={maxLength} />
          </>
        }
        rightContent={
          post.previewImage && (
            <ImageSection
              imageUrl={post.previewImage}
              alt={post.title || 'Post image'}
              aspectRatio="4/3"
            />
          )
        }
      />
    </BaseFeedItem>
  );
};
