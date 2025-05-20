import { ApiClient } from './client';
import { Journal } from '@/types/journal';
import { FeedApiResponse } from '@/types/feed';

interface JournalResponse {
  id: number;
  name: string;
  slug: string;
  hub_image?: string;
  description?: string;
}

interface JournalsApiResponse {
  results: JournalResponse[];
}

export class JournalService {
  private static readonly BASE_PATH = '/api/search/journal';
  private static readonly JOURNAL_FEED_PATH = '/api/journal_feed';

  static async getJournals(): Promise<Journal[]> {
    const response = await ApiClient.get<JournalsApiResponse>(`${this.BASE_PATH}/`);
    return response.results.map((journal) => ({
      id: journal.id,
      name: journal.name,
      slug: journal.slug,
      imageUrl: journal.hub_image,
      description: journal.description,
    }));
  }

  /**
   * Fetches journal papers from the backend API
   * @param params Options for the API request
   * @returns A promise that resolves to the API response
   */
  static async getJournalPapers(params?: {
    page?: number;
    pageSize?: number;
    publicationStatus?: 'PREPRINT' | 'PUBLISHED' | 'ALL';
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

    const url = `${this.JOURNAL_FEED_PATH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      return await ApiClient.get<FeedApiResponse>(url);
    } catch (error) {
      console.error('Error fetching journal papers:', error);
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
