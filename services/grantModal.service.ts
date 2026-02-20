import { ApiClient } from './client';

export interface GrantForModal {
  id: string;
  title: string;
  noteId: number | null;
  createdDate: string;
  status: 'published' | 'draft';
}

const transformGrantForModal = (raw: any): GrantForModal => ({
  id: raw.id.toString(),
  title: raw.title || 'Untitled RFP',
  noteId: raw.note?.id ?? null,
  createdDate: raw.created_date,
  status: raw.doi ? 'published' : 'draft',
});

export class GrantModalService {
  private static readonly BASE_PATH = '/api/researchhubpost';

  static async getGrantsByUser(userId: number): Promise<GrantForModal[]> {
    const response = await ApiClient.get<{ results: any[] }>(
      `${this.BASE_PATH}/?created_by=${userId}&document_type=GRANT`
    );
    return response.results.map(transformGrantForModal);
  }
}
