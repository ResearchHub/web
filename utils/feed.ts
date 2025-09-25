import { Content, FeedContentType } from '@/types/feed';
import { ContentType } from '@/types/work';

/**
 * Extracts the related work ID from different Content types using type narrowing
 * @param content The Content object to extract the related work ID from
 * @returns The related work ID if found, undefined otherwise
 */
export function getRelatedWorkId(content: Content): number | string | undefined {
  // Type narrowing based on contentType
  switch (content.contentType) {
    case 'PREREGISTRATION':
    case 'POST':
    case 'PAPER':
    case 'GRANT':
    case 'APPLICATION':
      // These are the work themselves, so return their own ID
      return content.id;

    case 'BOUNTY':
    case 'COMMENT':
      // These have relatedDocumentId property that points to the related work
      return content.relatedDocumentId;

    default:
      // This should never happen with the simplified Content type
      return undefined;
  }
}

/**
 * Extracts the related work content type from different Content types using type narrowing
 * @param content The Content object to extract the related work content type from
 * @returns The related work content type if found, undefined otherwise
 */
export function getRelatedWorkContentType(content: Content): ContentType | undefined {
  // Type narrowing based on contentType
  switch (content.contentType) {
    case 'PREREGISTRATION':
    case 'POST':
    case 'GRANT':
    case 'APPLICATION':
      // These are posts, so return 'post'
      return 'post';

    case 'PAPER':
      // This is a paper, so return 'paper'
      return 'paper';

    case 'BOUNTY':
    case 'COMMENT':
      // These have relatedDocumentContentType property
      return content.relatedDocumentContentType;

    default:
      // This should never happen with the simplified Content type
      return undefined;
  }
}

/**
 * Gets both related work ID and content type from a Content object
 * @param content The Content object to extract information from
 * @returns An object with relatedWorkId and relatedWorkContentType, or undefined values if not found
 */
export function getRelatedWorkInfo(content: Content): {
  relatedWorkId?: number | string;
  relatedWorkContentType?: ContentType;
} {
  return {
    relatedWorkId: getRelatedWorkId(content),
    relatedWorkContentType: getRelatedWorkContentType(content),
  };
}
