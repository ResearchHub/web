import { ApiClient } from './client';
import { transformNote, transformNoteContent } from '@/types/note';
import type { Note, NoteContent } from '@/types/note';

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
  private static readonly BASE_PATH = '/api';

  /**
   * Fetches a specific note by ID
   * @param noteId - The ID of the note to fetch
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async getNote(noteId: string): Promise<NoteContent> {
    if (!noteId) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(`${this.BASE_PATH}/note/${noteId}/`);
      return transformNoteContent(response);
    } catch (error) {
      throw new NoteError(
        'Failed to fetch note content',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

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
        `${this.BASE_PATH}/organization/${orgSlug}/get_organization_notes/`
      );

      if (!response || !Array.isArray(response.results)) {
        throw new NoteError('Invalid response format', 'INVALID_RESPONSE');
      }

      return {
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        results: response.results.map(transformNote),
      };
    } catch (error) {
      if (error instanceof NoteError) {
        throw error;
      }
      throw new NoteError(
        'Failed to fetch organization notes',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
