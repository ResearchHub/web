import { ContentType } from '@/types/work';

/**
 * Maps a ContentType to the corresponding API endpoint path
 * @param contentType The content type from the application
 * @returns The API endpoint path for the content type
 */
export function getContentTypePath(contentType: ContentType): string {
  // Map 'post' content type to 'researchhubpost' for API calls
  if (contentType === 'post') {
    return 'researchhubpost';
  }
  // Map 'preregistration' to the correct API path if needed
  if (contentType === 'preregistration') {
    return 'researchhubpost';
  }

  if (contentType === 'funding_request') {
    return 'researchhubpost';
  }

  return contentType.toLowerCase();
}

/**
 * Maps document types from the API to content types for URL building
 * @param documentType The document type from the API (e.g., 'GRANT', 'PREREGISTRATION', 'DISCUSSION')
 * @returns The corresponding content type for URL building
 */
export function mapApiContentTypeToClientType(
  documentType: string
): 'paper' | 'post' | 'funding_request' | 'preregistration' {
  const contentTypeMap: Record<string, 'paper' | 'post' | 'funding_request' | 'preregistration'> = {
    GRANT: 'funding_request',
    PREREGISTRATION: 'preregistration',
    DISCUSSION: 'post',
    ELN: 'post',
    NOTE: 'post',
    PAPER: 'paper',
    QUESTION: 'post',
    BOUNTY: 'post',
    HYPOTHESIS: 'post',
  };
  return contentTypeMap[documentType] ?? 'post';
}
