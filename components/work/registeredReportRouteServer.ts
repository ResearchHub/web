import { cache } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import type { RegisteredReportWorkResponse } from '@/types/registeredReport';

/**
 * Loads registered-report work or renders the 404 page.
 */
export const getRegisteredReportWorkOrNotFound = cache(
  async (id: string | number): Promise<RegisteredReportWorkResponse> => {
    const normalizedId = Number(id);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      notFound();
    }

    try {
      return await PostService.getRegisteredReportWork(normalizedId);
    } catch {
      notFound();
    }
  }
);
