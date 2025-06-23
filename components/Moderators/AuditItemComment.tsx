'use client';

import { FC, useMemo } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { FeedItemComment } from '@/components/Feed/items/FeedItemComment';
import { FeedEntry, FeedCommentContent } from '@/types/feed';
import { Work, ContentType } from '@/types/work';
import { getAuditUserInfo, getAuditContentUrl } from './utils/auditUtils';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemCommentProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

/**
 * Transform audit entry to feed entry format for reuse with FeedItemComment
 */
const transformAuditCommentToFeedEntry = (entry: FlaggedContent): FeedEntry => {
  const userInfo = getAuditUserInfo(entry);
  const item = entry.item!;

  // Create feed-compatible author profile
  const authorProfile = {
    id: userInfo.authorId || 0,
    fullName: userInfo.name,
    firstName: userInfo.name.split(' ')[0] || '',
    lastName: userInfo.name.split(' ').slice(1).join(' ') || '',
    profileImage: userInfo.avatar || '',
    headline: '',
    profileUrl: userInfo.authorId ? `/author/${userInfo.authorId}` : '',
    isClaimed: !userInfo.isRemoved,
    isVerified: false,
  };

  // Detect content format and prepare content
  let contentFormat: 'QUILL_EDITOR' | 'TIPTAP' = 'QUILL_EDITOR';
  let processedContent = item.comment_content_json;

  if (item.comment_content_json) {
    // Handle string format (JSON string)
    if (typeof item.comment_content_json === 'string') {
      try {
        const parsed = JSON.parse(item.comment_content_json);
        processedContent = parsed;

        // Detect format based on structure
        if (parsed.type === 'doc' && parsed.content) {
          contentFormat = 'TIPTAP';
        } else if (parsed.ops && Array.isArray(parsed.ops)) {
          contentFormat = 'QUILL_EDITOR';
        }
      } catch {
        // Keep as string if parsing fails
        processedContent = item.comment_content_json;
      }
    } else if (typeof item.comment_content_json === 'object') {
      // Handle object format
      if (item.comment_content_json.type === 'doc' && item.comment_content_json.content) {
        contentFormat = 'TIPTAP';
      } else if (item.comment_content_json.ops && Array.isArray(item.comment_content_json.ops)) {
        contentFormat = 'QUILL_EDITOR';
      }
      processedContent = item.comment_content_json;
    }
  }

  // Extract related document information for better context
  const relatedDocument = item.thread?.content_object?.unified_document?.documents?.[0];
  const documentType = item.thread?.content_object?.unified_document?.document_type;

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

  // Create comment content
  const commentContent: FeedCommentContent = {
    id: item.id,
    contentType: 'COMMENT',
    createdDate: item.created_date || entry.createdDate,
    updatedDate: item.updated_date,
    createdBy: authorProfile,
    isRemoved: userInfo.isRemoved,
    comment: {
      id: item.id,
      content: processedContent || 'No content available',
      contentFormat: contentFormat,
      commentType: item.comment_type || 'GENERIC_COMMENT',
      score: item.score || 0,
      reviewScore: item.review_score || item.score || 0,
      thread: item.thread
        ? {
            id: item.thread.id,
            threadType: documentType === 'PAPER' ? 'PAPER' : 'POST',
            objectId: relatedDocument?.id,
          }
        : undefined,
    },
    relatedDocumentId: relatedDocument?.id,
    relatedDocumentContentType: documentType ? getContentType(documentType) : 'post',
  };

  // Add review data if this is a review
  if (item.comment_type === 'REVIEW') {
    commentContent.review = {
      score: item.review_score || item.score || 0,
    };
  }

  return {
    id: `audit-comment-${item.id}`,
    timestamp: item.created_date || entry.createdDate,
    action: 'contribute',
    content: commentContent,
    contentType: 'COMMENT',
    metrics: {
      votes: item.score || 0,
      comments: 0,
      saves: 0,
      reviewScore: item.comment_type === 'REVIEW' ? item.review_score || item.score || 0 : 0,
    },
    relatedWork: relatedDocument
      ? {
          id: relatedDocument.id,
          contentType: documentType ? getContentType(documentType) : 'post',
          title: relatedDocument.title || 'Untitled',
          slug: relatedDocument.slug || `item-${relatedDocument.id}`, // Fallback slug if none exists
          createdDate: item.created_date || entry.createdDate,
          authors: [], // TODO: Could extract authors from thread data if available
          abstract: relatedDocument.renderable_text || 'No preview available',
          topics: [], // TODO: Could extract topics if available
          formats: [],
          figures: [],
        }
      : undefined,
  };
};

export const AuditItemComment: FC<AuditItemCommentProps> = ({
  entry,
  onAction,
  view = 'pending',
}) => {
  const verdict = entry.verdict;
  const contentUrl = getAuditContentUrl(entry);

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
