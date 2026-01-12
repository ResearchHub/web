'use client';

import { FC } from 'react';
import { FeedPostContent, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemAbstractSection } from '@/components/Feed/FeedItemAbstractSection';
import { FeedItemMenuButton } from '@/components/Feed/FeedItemMenuButton';
import { FeedItemBadges } from '@/components/Feed/FeedItemBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';
import { buildWorkUrl } from '@/utils/url';

interface FeedItemPostProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
  onAbstractExpanded?: () => void;
  highlights?: Highlight[];
  showHeader?: boolean;
  showBountyInfo?: boolean;
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
  onAbstractExpanded,
  highlights,
  showBountyInfo,
}) => {
  // Extract the post from the entry's content
  const post = entry.content as FeedPostContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

  // Convert authors to the format expected by AuthorList
  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.profileUrl,
    })) || [];

  // Use provided href or create default post page URL
  const postPageUrl =
    href ||
    buildWorkUrl({
      id: post.id,
      slug: post.slug,
      contentType: post.postType === 'QUESTION' ? 'question' : 'post',
    });

  // Extract props for FeedItemMenuButton (same as BaseFeedItem uses for FeedItemActions)
  const feedContentType = post.contentType || 'POST';
  const votableEntityId = post.id;
  const relatedDocumentId =
    'relatedDocumentId' in post ? post.relatedDocumentId?.toString() : post.id.toString();
  const relatedDocumentContentType = mapFeedContentTypeToContentType(post.contentType);

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
      showBountyInfo={showBountyInfo}
      hideReportButton={true}
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
        rightContent={
          <FeedItemMenuButton
            feedContentType={feedContentType}
            votableEntityId={votableEntityId}
            relatedDocumentId={relatedDocumentId}
            relatedDocumentContentType={relatedDocumentContentType}
            relatedDocumentUnifiedDocumentId={post.unifiedDocumentId}
          />
        }
        leftContent={
          <FeedItemBadges
            topics={post.topics}
            category={post.category}
            subcategory={post.subcategory}
          />
        }
      />
      {/* Main content layout with desktop image */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection
              title={post.title}
              highlightedTitle={highlightedTitle}
              href={postPageUrl}
              onClick={onFeedItemClick}
            />

            <div>
              {/* Authors list below title */}
              {authors.length > 0 && (
                <MetadataSection>
                  <div className="flex items-start gap-1.5">
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

            {/* Content Section - handles both desktop and mobile */}
            <FeedItemAbstractSection
              content={post.textPreview}
              highlightedContent={highlightedSnippet}
              maxLength={maxLength}
              mobileLabel="Read more"
              onAbstractExpanded={onAbstractExpanded}
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
