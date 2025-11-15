'use client';

import { FC, useMemo } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { FeedItemComment } from '@/components/Feed/items/FeedItemComment';
import { FeedEntry, FeedCommentContent } from '@/types/feed';
import { ContentType } from '@/types/work';
import { getAuditUserInfo } from './utils/auditUtils';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemCommentProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

/**
 * Helper function to detect content format based on structure
 */
const detectContentFormat = (content: any): 'QUILL_EDITOR' | 'TIPTAP' => {
  if (content.type === 'doc' && content.content) {
    return 'TIPTAP';
  }
  if (content.ops && Array.isArray(content.ops)) {
    return 'QUILL_EDITOR';
  }
  return 'QUILL_EDITOR';
};

/**
 * Helper function to process comment content format
 */
const processCommentContent = (commentContentJson: string | object) => {
  let contentFormat: 'QUILL_EDITOR' | 'TIPTAP' = 'QUILL_EDITOR';
  let processedContent = commentContentJson;

  if (!commentContentJson) {
    return { contentFormat, processedContent };
  }

  if (typeof commentContentJson === 'string') {
    try {
      const parsed = JSON.parse(commentContentJson);
      processedContent = parsed;
      contentFormat = detectContentFormat(parsed);
    } catch {
      // Keep as string if parsing fails
      processedContent = commentContentJson;
    }
  } else if (typeof commentContentJson === 'object') {
    contentFormat = detectContentFormat(commentContentJson);
    processedContent = commentContentJson;
  }

  return { contentFormat, processedContent };
};

/**
 * Helper function to create author profile from user info
 */
const createAuthorProfile = (userInfo: any) => {
  const nameParts = userInfo.name.split(' ');
  return {
    id: userInfo.authorId ?? 0,
    fullName: userInfo.name,
    firstName: nameParts[0] ?? '',
    lastName: nameParts.slice(1).join(' ') ?? '',
    profileImage: userInfo.avatar ?? '',
    headline: '',
    profileUrl: userInfo.authorId ? `/author/${userInfo.authorId}` : '',
    isClaimed: !userInfo.isRemoved,
    isVerified: false,
  };
};

/**
 * Helper function to map document types to content types
 */
const mapDocumentTypeToContentType = (docType: string): ContentType => {
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

/**
 * Transform audit entry to feed entry format for reuse with FeedItemComment
 */
const transformAuditCommentToFeedEntry = (entry: FlaggedContent): FeedEntry => {
  const userInfo = getAuditUserInfo(entry);
  const item = entry.item!;

  // Create feed-compatible author profile
  const authorProfile = createAuthorProfile(userInfo);

  // Detect content format and prepare content
  const { contentFormat, processedContent } = processCommentContent(item.comment_content_json);

  // Extract related document information for better context
  const relatedDocument = item.thread?.content_object?.unified_document?.documents?.[0];
  const documentType = item.thread?.content_object?.unified_document?.document_type;

  // Create comment content
  const commentContent: FeedCommentContent = {
    id: item.id,
    contentType: 'COMMENT',
    createdDate: item.created_date ?? entry.createdDate,
    updatedDate: item.updated_date,
    createdBy: authorProfile,
    isRemoved: userInfo.isRemoved,
    comment: {
      id: item.id,
      content: processedContent ?? 'No content available',
      contentFormat: contentFormat,
      commentType: item.comment_type ?? 'GENERIC_COMMENT',
      score: item.score ?? 0,
      reviewScore: item.review_score ?? item.score ?? 0,
      thread: item.thread
        ? {
            id: item.thread.id,
            threadType: documentType === 'PAPER' ? 'PAPER' : 'POST',
            objectId: relatedDocument?.id,
          }
        : undefined,
    },
    relatedDocumentId: relatedDocument?.id,
    relatedDocumentContentType: documentType ? mapDocumentTypeToContentType(documentType) : 'post',
  };

  // Add review data if this is a review
  if (item.comment_type === 'REVIEW') {
    commentContent.review = {
      score: item.review_score ?? item.score ?? 0,
    };
  }

  // Create related work
  const relatedWork = relatedDocument
    ? {
        id: relatedDocument.id,
        contentType: documentType ? mapDocumentTypeToContentType(documentType) : 'post',
        title: relatedDocument.title ?? 'Untitled',
        slug: relatedDocument.slug ?? `item-${relatedDocument.id}`,
        createdDate: item.created_date ?? entry.createdDate,
        authors: [],
        abstract: relatedDocument.renderable_text ?? 'No preview available',
        topics: [],
        formats: [],
        figures: [],
      }
    : undefined;

  return {
    id: `audit-comment-${item.id}`,
    recommendationId: null,
    timestamp: item.created_date ?? entry.createdDate,
    action: 'contribute',
    content: commentContent,
    contentType: 'COMMENT',
    metrics: {
      votes: item.score ?? 0,
      comments: 0,
      saves: 0,
      reviewScore: item.comment_type === 'REVIEW' ? (item.review_score ?? item.score ?? 0) : 0,
    },
    relatedWork,
  };
};

export const AuditItemComment: FC<AuditItemCommentProps> = ({
  entry,
  onAction,
  view = 'pending',
}) => {
  const verdict = entry.verdict;

  // Transform audit entry to feed entry format
  const feedEntry = useMemo(() => transformAuditCommentToFeedEntry(entry), [entry]);

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Moderation metadata at the top */}
      <div className="px-4 pt-4">
        <ModerationMetadata entry={entry} />
      </div>

      {/* Use existing FeedItemComment for consistent rendering */}
      <div className="px-4 pb-4">
        <FeedItemComment
          entry={feedEntry}
          href={undefined}
          showCreatorActions={false} // Disable edit/delete for audit context
          showRelatedWork={true} // Show related work context for better moderation decisions
          hideActions={true} // We'll use our own moderation actions
          maxLength={400} // Consistent with our previous truncation
          showReadMoreCTA={true} // Allow users to expand content
          showTooltips={true} // Keep tooltips for better UX
        />
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
