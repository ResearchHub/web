import { FlaggedContent } from '@/services/audit.service';
import { buildWorkUrl } from '@/utils/url';
import { extractTextFromTipTap } from '@/components/Comment/lib/commentContentUtils';

/**
 * SIMPLIFIED AUDIT UTILS
 *
 * This file now leverages existing utilities instead of duplicating logic:
 * - buildWorkUrl() from utils/url.ts
 * - CommentReadOnly component for content rendering
 * - FeedItemHeader for user/timestamp display
 *
 * We avoid importing the audit transformation functions due to type incompatibilities
 * between @/services/audit.service and @/types/audit FlaggedContent types.
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
  if (!item?.thread?.content_object?.unified_document?.documents?.[0]) {
    return null;
  }

  const document = item.thread.content_object.unified_document.documents[0];
  const documentType = item.thread.content_object.unified_document.document_type;

  // Build URL based on document type
  switch (documentType) {
    case 'PAPER':
      return buildWorkUrl({
        id: document.id,
        contentType: 'paper',
        slug: document.slug,
      });
    case 'DISCUSSION':
      return buildWorkUrl({
        id: document.id,
        contentType: 'post',
        slug: document.slug,
      });
    case 'PREREGISTRATION':
      return buildWorkUrl({
        id: document.id,
        contentType: 'preregistration',
        slug: document.slug,
      });
    default:
      return `/post/${document.id}/${document.slug ?? ''}`;
  }
};

/**
 * Extract text from Quill format content
 */
const extractTextFromQuillContent = (jsonContent: any): string => {
  if (jsonContent.ops && Array.isArray(jsonContent.ops)) {
    const extractedText = jsonContent.ops
      .map((op: any) => op.insert ?? '')
      .join('')
      .trim();

    if (extractedText) {
      return extractedText;
    }
  }
  return '';
};

/**
 * Extract text from TipTap format content
 */
const extractTextFromTipTapDocument = (jsonContent: any): string => {
  if (jsonContent.content || jsonContent.type === 'doc') {
    const extractedText = extractTextFromTipTap(jsonContent);
    if (extractedText) {
      return extractedText.trim();
    }
  }
  return '';
};

/**
 * Process JSON comment content and extract text
 */
const processJsonCommentContent = (jsonContent: any): string => {
  // Try extracting from Quill format first
  const quillText = extractTextFromQuillContent(jsonContent);
  if (quillText) {
    return quillText;
  }

  // Try extracting from TipTap format
  const tipTapText = extractTextFromTipTapDocument(jsonContent);
  if (tipTapText) {
    return tipTapText;
  }

  return 'No readable content found';
};

/**
 * Handle comment content JSON parsing and extraction
 */
export const handleCommentContentJson = (commentContentJson: string | object): string => {
  // Handle special case for removed content
  if (typeof commentContentJson === 'string' && commentContentJson.includes('[Comment removed]')) {
    return '[Comment removed]';
  }

  try {
    const jsonContent =
      typeof commentContentJson === 'string' ? JSON.parse(commentContentJson) : commentContentJson;

    return processJsonCommentContent(jsonContent);
  } catch (e) {
    console.warn('Failed to parse comment_content_json:', e);
    return 'Error parsing comment content';
  }
};

/**
 * Get content from thread document
 */
export const getContentFromThreadDocument = (contentItem: any): string => {
  const document = contentItem.thread?.content_object?.unified_document?.documents?.[0];
  if (!document) {
    return '';
  }

  return (
    document.renderable_text ??
    document.title ??
    document.abstract ??
    'No content preview available'
  );
};

/**
 * Get fallback content from various fields
 */
export const getFallbackContent = (contentItem: any): string => {
  return (
    contentItem.content ??
    contentItem.text ??
    contentItem.title ??
    contentItem.description ??
    contentItem.renderable_text ??
    contentItem.abstract ??
    'No content preview available'
  );
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

/**
 * Check if content should show truncation based on length
 */
export const shouldShowTruncation = (entry: FlaggedContent, maxLength: number = 400): boolean => {
  const textContent = getAuditContentPreview(entry);
  return textContent.length > maxLength;
};
