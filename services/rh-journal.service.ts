import { ApiClient } from './client';
import { FeedApiResponse } from '@/types/feed';

export class RHJournalService {
  private static readonly JOURNAL_FEED_PATH = '/api/journal_feed';

  /**
   * Fetches ResearchHub Journal papers from the backend API
   * @param params Options for the API request
   * @returns A promise that resolves to the API response
   */
  static async getJournalPapers(params?: {
    page?: number;
    pageSize?: number;
    publicationStatus?: 'PREPRINT' | 'PUBLISHED' | 'ALL';
    journalStatus?: 'IN_JOURNAL' | 'NOT_IN_JOURNAL' | 'ALL';
  }): Promise<FeedApiResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    if (params?.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }

    if (params?.publicationStatus) {
      queryParams.append('publication_status', params.publicationStatus);
    }

    if (params?.journalStatus) {
      queryParams.append('journal_status', params.journalStatus);
    }

    const url = `${this.JOURNAL_FEED_PATH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      return await ApiClient.get<FeedApiResponse>(url);
    } catch (error) {
      console.error('Error fetching RH journal papers:', error);
      // Return empty response on error
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  }
}
