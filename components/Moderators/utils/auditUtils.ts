import { FlaggedContent } from '@/services/audit.service';
import { buildWorkUrl } from '@/utils/url';

/**
 * SIMPLIFIED AUDIT UTILS
 *
 * This file now leverages existing utilities instead of duplicating logic:
 * - buildWorkUrl() from utils/url.ts
 * - CommentReadOnly component for content rendering
 * - FeedItemHeader for user/timestamp display
 */

/**
 * Get user information from flagged content entry
 */
export const getAuditUserInfo = (entry: FlaggedContent) => {
  if (entry.item?.created_by) {
    const createdBy = entry.item.created_by;
    const fullName = `${createdBy.first_name ?? ''} ${createdBy.last_name ?? ''}`.trim();
    return {
      name: fullName || 'Unknown User', // Keep || here since we want to catch empty strings
      avatar: createdBy.author_profile?.profile_image ?? null,
      authorId: createdBy.author_profile?.id ?? null,
      isRemoved: false,
    };
  }

  // If created_by is null, this likely means the content was removed
  return {
    name: 'Removed User',
    avatar: null,
    authorId: null,
    isRemoved: true,
  };
};

/**
 * Generate content URL for audit entry
 */
export const getAuditContentUrl = (entry: FlaggedContent): string | null => {
  const item = entry.item;

  // For researchhubpost content type, check direct unified_document structure first
  const directDocument = item?.unified_document?.documents?.[0];
  const directDocumentType = item?.unified_document?.document_type;

  // For other content types, check thread structure
  const threadDocument = item?.thread?.content_object?.unified_document?.documents?.[0];
  const threadDocumentType = item?.thread?.content_object?.unified_document?.document_type;

  const document = directDocument ?? threadDocument;
  const documentType = directDocumentType ?? threadDocumentType;

  if (!document) {
    return null;
  }

  // Build URL based on document type
  switch (documentType) {
    case 'PAPER':
      return buildWorkUrl({
        id: document.id,
        contentType: 'paper',
        slug: document.slug ?? item?.slug,
      });
    case 'DISCUSSION':
      return buildWorkUrl({
        id: document.id,
        contentType: 'post',
        slug: document.slug ?? item?.slug,
      });
    case 'PREREGISTRATION':
      return buildWorkUrl({
        id: document.id,
        contentType: 'preregistration',
        slug: document.slug ?? item?.slug,
      });
    default:
      return `/post/${document.id}/${document.slug ?? item?.slug ?? ''}`;
  }
};

/**
 * Get content preview text for truncation detection
 */
export const getAuditContentPreview = (entry: FlaggedContent): string => {
  if (!entry.item) {
    return 'Content not available';
  }

  const commentContent = entry.item.comment_content_json;

  if (!commentContent) {
    return 'No content available';
  }

  // Handle string format (JSON string)
  if (typeof commentContent === 'string') {
    try {
      const parsed = JSON.parse(commentContent);
      return extractTextFromContentJson(parsed);
    } catch {
      return commentContent; // Fallback to raw string
    }
  }

  // Handle object format
  if (typeof commentContent === 'object') {
    return extractTextFromContentJson(commentContent);
  }

  return 'Content format not supported';
};

/**
 * Extract plain text from various content JSON formats
 */
const extractTextFromContentJson = (contentJson: any): string => {
  if (!contentJson) return '';

  // Handle Quill Delta format: {"ops": [{"insert": "text"}]}
  if (contentJson.ops && Array.isArray(contentJson.ops)) {
    return contentJson.ops
      .map((op: any) => {
        if (typeof op.insert === 'string') {
          return op.insert;
        }
        // Handle mentions: {"insert": {"mention": {"id": 123, "name": "User"}}}
        if (op.insert && typeof op.insert === 'object' && op.insert.mention) {
          return `@${op.insert.mention.name ?? 'User'}`;
        }
        return '';
      })
      .join('')
      .trim();
  }

  // Handle TipTap format: {"type": "doc", "content": [...]}
  if (contentJson.type === 'doc' && contentJson.content) {
    return extractTextFromTipTapArray(contentJson.content);
  }

  // Handle direct content array (sometimes TipTap comes without wrapper)
  if (Array.isArray(contentJson.content)) {
    return extractTextFromTipTapArray(contentJson.content);
  }

  // Fallback: try to stringify and extract meaningful text
  const str = JSON.stringify(contentJson);
  const textMatch = str.match(/"text":"([^"]+)"/g);
  if (textMatch) {
    return textMatch.map((match) => match.replace(/"text":"([^"]+)"/, '$1')).join(' ');
  }

  return 'Content format not recognized';
};

/**
 * Extract text from TipTap content array
 */
const extractTextFromTipTapArray = (content: any[]): string => {
  if (!Array.isArray(content)) return '';

  return content
    .map((node: any) => {
      if (node.type === 'text') {
        return node.text ?? '';
      }
      if (node.content && Array.isArray(node.content)) {
        return extractTextFromTipTapArray(node.content);
      }
      if (node.type === 'mention' && node.attrs?.label) {
        return `@${node.attrs.label}`;
      }
      return '';
    })
    .join('')
    .trim();
};
