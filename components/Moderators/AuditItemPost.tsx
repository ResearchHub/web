'use client';

import { FC, useMemo } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Work, ContentType } from '@/types/work';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { getAuditUserInfo, getAuditContentUrl } from './utils/auditUtils';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemPostProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

/**
 * Transform audit entry to feed entry format for reuse with FeedItemPost
 */
const transformAuditPostToFeedEntry = (
  entry: FlaggedContent
): { feedEntry: FeedEntry; relatedWork?: Work } => {
  const userInfo = getAuditUserInfo(entry);
  const item = entry.item!;

  // Create feed-compatible author profile
  const authorProfile = {
    id: userInfo.authorId ?? 0,
    fullName: userInfo.name,
    firstName: userInfo.name.split(' ')[0] ?? '',
    lastName: userInfo.name.split(' ').slice(1).join(' ') ?? '',
    profileImage: userInfo.avatar ?? '',
    headline: '',
    profileUrl: userInfo.authorId ? `/author/${userInfo.authorId}` : '',
    isClaimed: !userInfo.isRemoved,
    isVerified: false,
  };

  // Extract post information from the thread/document structure
  const document = item.thread?.content_object?.unified_document?.documents?.[0];
  const documentType = item.thread?.content_object?.unified_document?.document_type;

  const title = document?.title ?? 'Untitled Post';
  const textPreview = document?.renderable_text ?? 'No content available';
  const slug = document?.slug ?? '';

  // Map document types to content types
  const getContentType = (docType: string): ContentType => {
    switch (docType) {
      case 'PAPER':
        return 'paper';
      case 'PREREGISTRATION':
        return 'preregistration';
      case 'DISCUSSION':
      case 'POST':
      default:
        return 'post';
    }
  };

  // Create post content
  const postContent: FeedPostContent = {
    id: document?.id ?? item.id,
    contentType: documentType === 'PREREGISTRATION' ? 'PREREGISTRATION' : 'POST',
    createdDate: item.created_date ?? entry.createdDate,
    textPreview: textPreview,
    slug: slug,
    title: title,
    previewImage: undefined,
    authors: [authorProfile], // Include the author
    topics: [],
    createdBy: authorProfile,
    bounties: [],
    reviews: [],
    fundraise: item.fundraise ?? undefined,
  };

  // Check if this post has related work (if it references another document)
  // This might happen if a post is a response to another post/paper
  const parentDocument = item.parent_thread?.content_object?.unified_document?.documents?.[0];
  const parentDocumentType = item.parent_thread?.content_object?.unified_document?.document_type;

  const relatedWork = parentDocument
    ? {
        id: parentDocument.id,
        contentType: parentDocumentType ? getContentType(parentDocumentType) : 'post',
        title: parentDocument.title ?? 'Untitled',
        slug: parentDocument.slug ?? `item-${parentDocument.id}`,
        createdDate: item.created_date ?? entry.createdDate,
        authors: [],
        abstract: parentDocument.renderable_text ?? 'No preview available',
        topics: [],
        formats: [],
        figures: [],
      }
    : undefined;

  const feedEntry: FeedEntry = {
    id: `audit-post-${item.id}`,
    timestamp: item.created_date ?? entry.createdDate,
    action: 'contribute',
    content: postContent,
    contentType: postContent.contentType,
    metrics: {
      votes: item.score ?? 0,
      comments: 0,
      saves: 0,
      reviewScore: 0,
    },
  };

  return { feedEntry, relatedWork };
};

export const AuditItemPost: FC<AuditItemPostProps> = ({ entry, onAction, view = 'pending' }) => {
  const verdict = entry.verdict;
  const contentUrl = getAuditContentUrl(entry);

  // Transform audit entry to feed entry format
  const { feedEntry, relatedWork } = useMemo(() => transformAuditPostToFeedEntry(entry), [entry]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Moderation metadata at the top */}
      <div className="px-4 pt-4">
        <ModerationMetadata entry={entry} />
      </div>

      {/* Use existing FeedItemPost for consistent rendering */}
      <div className="px-4 pb-4">
        <FeedItemPost
          entry={feedEntry}
          href={contentUrl ?? undefined}
          showActions={false} // We'll use our own moderation actions
          maxLength={400} // Consistent with our previous truncation
        />

        {/* Related Work - show if available */}
        {relatedWork && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <RelatedWorkCard size="sm" work={relatedWork} />
          </div>
        )}
      </div>

      {/* Moderation actions at the bottom */}
      <div className="px-4 pb-4">
        <ModerationActions
          onDismiss={() => onAction('dismiss')}
          onRemove={() => onAction('remove')}
          view={view}
          hasVerdict={!!verdict}
        />
      </div>
    </div>
  );
};
