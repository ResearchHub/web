import { ApiClient } from './client';
import { transformNote, transformNoteContent, transformNoteWithContent } from '@/types/note';
import type { Note, NoteAccess, NoteContent, NoteWithContent } from '@/types/note';
import { ID } from '@/types/root';

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

export interface CreateNoteParams {
  title: string;
  grouping: NoteAccess;
  organization_slug: string;
}

export interface UpdateNoteContentParams {
  note: ID;
  plain_text?: string;
  full_src?: string;
  full_json?: string;
}

export class NoteService {
  private static readonly BASE_PATH = '/api';

  /**
   * Fetches a specific note by ID
   * @param noteId - The ID of the note to fetch
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async getNote(noteId: string): Promise<NoteWithContent> {
    if (!noteId) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(`${this.BASE_PATH}/note/${noteId}/`);
      return transformNoteWithContent(response);
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

  /**
   * Creates a new note
   * @param params - The note creation parameters
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async createNote(params: CreateNoteParams): Promise<Note> {
    if (!params.organization_slug) {
      throw new NoteError('Missing organization slug', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/note/`, params);
      return transformNote(response);
    } catch (error) {
      throw new NoteError(
        'Failed to create note',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Updates the content of a note
   * @param params - The note content update parameters
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async updateNoteContent(params: UpdateNoteContentParams): Promise<NoteContent> {
    if (!params.note) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/note_content/`, params);
      return transformNoteContent(response);
    } catch (error) {
      throw new NoteError(
        'Failed to update note content',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Deletes a note by ID
   * @param noteId - The ID of the note to delete
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async deleteNote(noteId: ID): Promise<Note> {
    if (!noteId) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/note/${noteId}/delete/`);
      return transformNote(response);
    } catch (error) {
      throw new NoteError(
        'Failed to delete note',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
