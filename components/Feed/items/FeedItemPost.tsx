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
import { BookText, Users } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { formatTimestamp } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';

interface FeedItemPostProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  showBountyInfoSummary?: boolean;
  highlights?: Highlight[];
  showHeader?: boolean;
}

/**
 * Post Feed Item using BaseFeedItem
 */
export const FeedItemPost: FC<FeedItemPostProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  showHeader = true,
  maxLength,
  onFeedItemClick,
  showBountyInfoSummary = true,
  highlights,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Get topics/tags for display
  const topics = (post.topics || []).filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

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
      showHeader={showHeader}
      showTooltips={showTooltips}
      customActionText={post.postType === 'QUESTION' ? 'asked a question' : 'published an article'}
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showPeerReviews={post.postType !== 'QUESTION'}
      showBountyInfoSummary={showBountyInfoSummary}
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
            <ContentTypeBadge
              type={
                post.postType === 'QUESTION'
                  ? 'question'
                  : post.contentType === 'PREREGISTRATION'
                    ? 'funding'
                    : 'article'
              }
            />
            {topics.map((topic) => (
              <TopicAndJournalBadge
                key={topic.id || topic.slug}
                name={topic.name}
                slug={topic.slug}
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
            <TitleSection title={post.title} highlightedTitle={highlightedTitle} />

            <div>
              {/* Authors list below title */}
              {authors.length > 0 && (
                <MetadataSection>
                  <div className="flex items-start gap-1.5">
                    <Users className="w-4 h-4 text-gray-500" />
                    <AuthorList
                      authors={authors}
                      size="sm"
                      className="text-gray-500 font-normal text-sm"
                      delimiter="•"
                      timestamp={post.createdDate ? formatTimestamp(post.createdDate) : undefined}
                    />
                  </div>
                </MetadataSection>
              )}
            </div>

            {/* Truncated Content */}
            <ContentSection
              content={post.textPreview}
              highlightedContent={highlightedSnippet}
              maxLength={maxLength}
            />
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
