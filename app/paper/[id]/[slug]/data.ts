import 'server-only';

import { forbidden } from 'next/navigation';
import { MetadataService } from '@/services/metadata.service';
import { ApiError } from '@/services/types';

/**
 * Loads paper metadata and renders the 403 page when access is forbidden.
 */
export async function getPaperMetadata(unifiedDocumentId: number | null | undefined) {
  try {
    return await MetadataService.get(unifiedDocumentId?.toString() || '');
  } catch (error) {
    // The paper can be visible even when its unified-document metadata is not.
    if (getApiStatus(error) === 403) {
      forbidden();
    }

    throw error;
  }
}

/**
 * Returns the HTTP status carried by ApiClient errors.
 */
function getApiStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status?: number }).status;
  }

  return undefined;
}
