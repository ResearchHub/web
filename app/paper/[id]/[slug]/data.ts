import 'server-only';

import { cache } from 'react';
import { MetadataService } from '@/services/metadata.service';
import { PaperService } from '@/services/paper.service';

/**
 * Deduplicates paper detail requests within a single server render.
 */
export const getPaper = cache(async (id: string) => {
  return PaperService.get(id);
});

/**
 * Deduplicates document metadata requests within a single server render.
 */
export const getDocumentMetadata = cache(async (unifiedDocumentId: number | null | undefined) => {
  return MetadataService.get(unifiedDocumentId?.toString() || '');
});
