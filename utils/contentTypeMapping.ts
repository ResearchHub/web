import { ContentType } from '@/types/work';
import { FeedContentType } from '@/types/feed';
import { DocumentType } from '@/services/reaction.service';

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
