import { FlaggedContent } from '@/services/audit.service';
import { extractTextFromTipTap } from '@/components/Comment/lib/commentContentUtils';

/**
 * Content type mapping for audit purposes
 */
export type AuditContentType = 'comment' | 'paper' | 'post' | 'unknown';

/**
 * Detect the content type from flagged content entry
 */
export const detectAuditContentType = (entry: FlaggedContent): AuditContentType => {
  const contentTypeName = entry.contentType.name.toLowerCase();

  switch (contentTypeName) {
    case 'rhcommentmodel':
      return 'comment';
    case 'paper':
      return 'paper';
    case 'researchhubpost':
      return 'post';
    default:
      return 'unknown';
  }
};

/**
 * Get structured content data based on content type
 */
export const getStructuredAuditContent = (entry: FlaggedContent) => {
  const contentType = detectAuditContentType(entry);
  const item = entry.item;

  switch (contentType) {
    case 'comment':
      return {
        type: 'comment' as const,
        id: item?.id,
        content: getFlaggedContentPreview(entry),
        contentFormat: item?.content_format || 'UNKNOWN',
        createdDate: item?.created_date,
        isReview: item?.comment_type === 'REVIEW',
        reviewScore: item?.review_score || item?.score,
        thread: item?.thread,
        parentDocument: getFlaggedContentParentDocument(entry),
      };

    case 'paper':
      return {
        type: 'paper' as const,
        id: item?.id,
        title: item?.title,
        abstract: item?.abstract,
        doi: item?.doi,
        authors: item?.authors || [],
        topics: item?.topics || [],
        journal: item?.journal,
        createdDate: item?.created_date,
        publishedDate: item?.published_date,
        url: item?.url,
        pdfUrl: item?.pdf_url,
        previewImage: item?.preview_image,
      };

    case 'post':
      return {
        type: 'post' as const,
        id: item?.id,
        title: item?.title,
        content: item?.renderable_text || item?.text || getFlaggedContentPreview(entry),
        authors: item?.authors || [],
        topics: item?.topics || [],
        createdDate: item?.created_date,
        previewImage: item?.preview_image,
        postType: item?.post_type,
        fundraise: item?.fundraise,
        institution: item?.institution,
      };

    default:
      return {
        type: 'unknown' as const,
        id: item?.id,
        content: getFlaggedContentPreview(entry),
        createdDate: item?.created_date,
        rawData: item,
      };
  }
};

/**
 * Get parent document information for context
 */
export const getFlaggedContentParentDocument = (entry: FlaggedContent) => {
  const documents = entry.item?.thread?.content_object?.unified_document?.documents;
  if (documents && documents.length > 0) {
    const doc = documents[0];
    return {
      id: doc.id,
      title: doc.title || 'Untitled Document',
      contentType: doc.content_type,
      slug: doc.slug,
      url: doc.url,
    };
  }
  return null;
};

/**
 * Get content preview from flagged content entry
 * Note: Does not censor removed content - shows actual content for moderation purposes
 */
export const getFlaggedContentPreview = (entry: FlaggedContent): string => {
  if (!entry.item) {
    return 'Content not available';
  }

  const contentItem = entry.item;

  // For comments with TipTap or Quill JSON content
  if (contentItem.comment_content_json) {
    try {
      const jsonContent =
        typeof contentItem.comment_content_json === 'string'
          ? JSON.parse(contentItem.comment_content_json)
          : contentItem.comment_content_json;

      // Extract text from Quill format (ops array)
      if (jsonContent.ops && Array.isArray(jsonContent.ops)) {
        const extractedText = jsonContent.ops
          .map((op: any) => op.insert || '')
          .join('')
          .trim();

        if (extractedText) {
          return extractedText;
        }
      }

      // Extract text from TipTap format using existing utility
      if (jsonContent.content || jsonContent.type === 'doc') {
        const extractedText = extractTextFromTipTap(jsonContent);
        if (extractedText) {
          return extractedText.trim();
        }
      }

      return 'No readable content found';
    } catch (e) {
      console.warn('Failed to parse comment_content_json:', e);
      return 'Error parsing comment content';
    }
  }

  // For posts and papers, get content from thread content object
  if (contentItem.thread?.content_object?.unified_document?.documents?.[0]) {
    const document = contentItem.thread.content_object.unified_document.documents[0];
    return (
      document.renderable_text ||
      document.title ||
      document.abstract ||
      'No content preview available'
    );
  }

  // Fallback to other possible content fields
  return (
    contentItem.content ||
    contentItem.text ||
    contentItem.title ||
    contentItem.description ||
    contentItem.renderable_text ||
    contentItem.abstract ||
    'No content preview available'
  );
};

/**
 * Get the parent document title from flagged content entry
 */
export const getFlaggedContentParentDocumentTitle = (entry: FlaggedContent): string => {
  const documents = entry.item?.thread?.content_object?.unified_document?.documents;
  if (documents && documents.length > 0) {
    return documents[0].title || 'Untitled Document';
  }
  return 'No parent document';
};

/**
 * Get offending user information from flagged content entry
 * Note: Shows actual user info even for removed content - moderators need to see this
 */
export const getFlaggedContentOffendingUser = (entry: FlaggedContent) => {
  if (entry.item?.created_by) {
    const createdBy = entry.item.created_by;
    const authorId = createdBy.author_profile?.id;

    return {
      name: `${createdBy.first_name || ''} ${createdBy.last_name || ''}`.trim() || 'Unknown User',
      avatar: createdBy.author_profile?.profile_image || null,
      authorId: typeof authorId === 'number' ? authorId : undefined,
      isRemoved: false,
    };
  }

  // If created_by is null, this likely means the content was removed
  // For moderators, we still want to show this information if available from verdict
  if (entry.verdict?.createdBy) {
    const removedBy = entry.verdict.createdBy;
    const authorId = removedBy.authorProfile.id;

    return {
      name: 'Content Removed by Moderator',
      avatar: null,
      authorId: undefined, // Don't link to removed user
      isRemoved: true,
      removedBy: {
        name: `${removedBy.authorProfile.firstName} ${removedBy.authorProfile.lastName}`,
        authorId: typeof authorId === 'number' ? authorId : undefined,
      },
    };
  }

  return {
    name: 'Removed User',
    avatar: null,
    authorId: undefined,
    isRemoved: true,
  };
};

/**
 * Get status color class based on verdict
 */
export const getFlaggedContentStatusColor = (verdict?: string): string => {
  if (!verdict) return 'bg-orange-100 text-orange-800';

  switch (verdict.toLowerCase()) {
    case 'open':
      return 'bg-orange-100 text-orange-800';
    case 'removed':
      return 'bg-red-100 text-red-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get display status based on verdict
 */
export const getFlaggedContentDisplayStatus = (verdict?: string): string => {
  if (!verdict) return 'Pending';

  switch (verdict.toLowerCase()) {
    case 'open':
      return 'Pending';
    case 'removed':
      return 'Removed';
    case 'approved':
      return 'Dismissed';
    default:
      return 'Unknown';
  }
};

/**
 * Generate appropriate URL for the flagged content
 */
export const generateAuditContentUrl = (entry: FlaggedContent): string | null => {
  const structuredContent = getStructuredAuditContent(entry);

  switch (structuredContent.type) {
    case 'comment':
      if (structuredContent.parentDocument) {
        const doc = structuredContent.parentDocument;
        if (doc.contentType === 'paper') {
          return `/paper/${doc.id}/${doc.slug}/conversation#comment-${structuredContent.id}`;
        } else {
          return `/post/${doc.id}/${doc.slug}/conversation#comment-${structuredContent.id}`;
        }
      }
      return null;

    case 'paper':
      return `/paper/${structuredContent.id}`;

    case 'post':
      return `/post/${structuredContent.id}`;

    default:
      return null;
  }
};
