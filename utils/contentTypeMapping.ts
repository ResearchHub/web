import { ContentType } from '@/types/work';
import { FeedContentType } from '@/types/feed';
import { DocumentType } from '@/services/reaction.service';

/**
 * Django document type from API (src/researchhub_document/related_models/constants/document_type.py)
 */
export type ApiDocumentType =
  | 'DISCUSSION'
  | 'ELN'
  | 'GRANT'
  | 'NOTE'
  | 'PAPER'
  | 'QUESTION'
  | 'PREREGISTRATION';

/**
 * Maps an API document type (from Django backend) to the client's ContentType (used in Work).
 *
 * @param documentType - The document type from the API
 * @returns The corresponding ContentType, or undefined if no mapping exists
 */
export function mapApiDocumentTypeToClientType(
  documentType?: ApiDocumentType
): ContentType | undefined {
  if (!documentType) {
    return undefined;
  }

  switch (documentType) {
    case 'PAPER':
      return 'paper';
    case 'PREREGISTRATION':
      return 'preregistration';
    case 'QUESTION':
      return 'question';
    case 'GRANT':
      return 'funding_request';
    case 'DISCUSSION':
      return 'post';
    case 'ELN':
    case 'NOTE':
    default:
      return undefined;
  }
}

/**
 * Maps a ContentType to the corresponding API endpoint path
 * @param contentType The content type from the application
 * @returns The document type for API calls
 */
export function mapAppContentTypeToApiType(contentType: ContentType): DocumentType {
  switch (contentType) {
    case 'post':
    case 'preregistration':
    case 'funding_request':
      return 'researchhubpost';
    case 'paper':
      return 'paper';
    default:
      return 'researchhubpost';
  }
}

/**
 * Maps FeedContentType to DocumentType for API calls
 * @param contentType The feed content type from the application
 * @returns The document type for API calls
 */
export function mapAppFeedContentTypeToApiType(contentType?: FeedContentType): DocumentType {
  if (!contentType) {
    return 'researchhubpost';
  }

  switch (contentType) {
    case 'PAPER':
      return 'paper';
    case 'POST':
    case 'PREREGISTRATION':
    case 'GRANT':
    case 'BOUNTY':
    case 'COMMENT':
    case 'APPLICATION':
      return 'researchhubpost';
    default:
      return 'researchhubpost';
  }
}
