import { ApiClient } from './client';
import { transformNote } from '@/types/note';
import type { Note } from '@/types/note';

export class NoteError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'NoteError';
  }
}

export interface NoteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Note[];
}

export class NoteService {
  private static readonly BASE_PATH = '/api/organization';

  /**
   * Fetches notes for a specific organization
   * @param orgSlug - The slug of the organization
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async getOrganizationNotes(orgSlug: string): Promise<NoteListResponse> {
    if (!orgSlug) {
      throw new NoteError('Missing organization slug', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/${orgSlug}/get_organization_notes/`
      );

      return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: response.results.map(transformNote),
      };
    } catch (error) {
      // TODO: Integrate with global error handling system for user alerts on API failures
      throw new NoteError(
        'Failed to fetch organization notes',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
