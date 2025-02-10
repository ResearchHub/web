import { ApiClient } from './client';
import { transformNotePermission } from '@/types/notePermission';
import type { NotePermission, NotePermissionApiItem } from '@/types/notePermission';

export class NotePermissionError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'NotePermissionError';
  }
}

export class NotePermissionService {
  private static readonly BASE_PATH = '/api/note';

  /**
   * Fetches permissions for a specific note
   * @param noteId - The ID of the note
   * @throws {NotePermissionError} When the request fails or parameters are invalid
   */
  static async getNotePermissions(noteId: string): Promise<NotePermission[]> {
    if (!noteId) {
      throw new NotePermissionError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<NotePermissionApiItem[]>(
        `${this.BASE_PATH}/${noteId}/get_note_permissions/`
      );

      if (!Array.isArray(response)) {
        throw new NotePermissionError('Invalid response format', 'INVALID_RESPONSE');
      }

      return response.map(transformNotePermission);
    } catch (error) {
      if (error instanceof NotePermissionError) {
        throw error;
      }
      throw new NotePermissionError(
        'Failed to fetch note permissions',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
