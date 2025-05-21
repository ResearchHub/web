import { ApiClient } from './client';
import { Journal } from '@/types/journal';

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
}
