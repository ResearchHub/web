import { FlaggedContent } from '@/services/audit.service';
import { buildWorkUrl } from '@/utils/url';

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
