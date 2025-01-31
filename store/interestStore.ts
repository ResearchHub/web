import { JournalService } from '@/services/journal.service';
import { HubService } from '@/services/hub.service';
import { AuthorService } from '@/services/author.service';

export interface Interest {
  id: string | number;
  name: string;
  type: 'journal' | 'person' | 'topic';
  imageUrl?: string;
  description?: string;
}

export async function fetchInterests(type: 'journal' | 'person' | 'topic'): Promise<Interest[]> {
  if (type === 'journal') {
    try {
      const journals = await JournalService.getJournals();
      return journals.map((journal) => ({
        id: journal.id,
        name: journal.name,
        type: 'journal' as const,
        imageUrl: journal.imageUrl,
        description: journal.description,
      }));
    } catch (error) {
      console.error('Error fetching journals:', error);
      return [];
    }
  }

  if (type === 'topic') {
    try {
      const hubs = await HubService.getHubs();
      return hubs.map((hub) => ({
        id: hub.id,
        name: hub.name,
        type: 'topic' as const,
        imageUrl: hub.imageUrl,
        description: hub.description,
      }));
    } catch (error) {
      console.error('Error fetching hubs:', error);
      return [];
    }
  }

  if (type === 'person') {
    try {
      const authors = await AuthorService.getAuthors();
      console.log('authors', authors);
      return authors.map((author) => ({
        id: author.id,
        name: author.name,
        type: 'person' as const,
        imageUrl: author.imageUrl,
        description: author.description,
      }));
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  return [];
}
