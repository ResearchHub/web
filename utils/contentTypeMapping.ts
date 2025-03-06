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
  return contentType.toLowerCase();
}
