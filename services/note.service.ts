import { ApiClient } from './client';
import { transformNote, transformNoteContent, transformNoteWithContent } from '@/types/note';
import type { Note, NoteAccess, NoteContent, NoteWithContent } from '@/types/note';
import { ID } from '@/types/root';
import { ApiError } from './types';
import { extractApiErrorMessage } from './lib/serviceUtils';

export class NoteError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
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
  document_type?: string;
}

export interface UpdateNoteContentParams {
  note: ID;
  plain_text?: string;
  full_src?: string;
  full_json?: string;
}

export interface UpdateNoteParams {
  noteId: ID;
  title?: string;
  document_type?: string;
}

export interface UpdateNoteTitleParams {
  noteId: ID;
  title: string;
}

export interface GetOrganizationNotesParams {
  status?: 'DRAFT' | 'PUBLISHED';
  documentType?: 'PREREGISTRATION' | 'GRANT' | 'DISCUSSION' | 'REGISTERED_REPORT';
}

export interface NoteInvitePreview {
  inviteType: string;
  recipientEmail?: string;
  note: NoteWithContent;
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
        extractApiErrorMessage(error, 'Failed to fetch note content'),
        undefined,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Fetches a note by invitation key.
   */
  static async getNoteByInviteKey(inviteKey: string): Promise<NoteInvitePreview> {
    if (!inviteKey) {
      throw new NoteError('Missing invitation key', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.getPublic<any>(
        `${this.BASE_PATH}/note/${inviteKey}/get_note_by_key/`
      );

      if (!response?.note) {
        throw new NoteError('Invalid invitation response', 'INVALID_RESPONSE');
      }

      return {
        inviteType: response.invite_type,
        recipientEmail: response.recipient_email,
        note: transformNoteWithContent(response.note),
      };
    } catch (error) {
      if (error instanceof NoteError) {
        throw error;
      }

      const errorMsg =
        error instanceof ApiError && error.status === 403
          ? 'This invitation link is invalid or has expired.'
          : 'Failed to fetch invited note';
      throw new NoteError(errorMsg, error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    }
  }

  /**
   * Accepts a note invitation and grants the matching user access.
   */
  static async acceptNoteInvite(inviteKey: string): Promise<boolean> {
    if (!inviteKey) {
      throw new NoteError('Missing invitation key', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post<any>(`${this.BASE_PATH}/invite/note/${inviteKey}/accept_invite/`);
      return true;
    } catch (error) {
      throw new NoteError(
        'Failed to accept note invitation',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Fetches notes for a specific organization
   * @param orgSlug - The slug of the organization
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async getOrganizationNotes(
    orgSlug: string,
    params?: GetOrganizationNotesParams
  ): Promise<NoteListResponse> {
    if (!orgSlug) {
      throw new NoteError('Missing organization slug', 'INVALID_PARAMS');
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.documentType) queryParams.append('type', params.documentType);
      const qs = queryParams.toString();

      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/organization/${orgSlug}/get_organization_notes/${qs ? `?${qs}` : ''}`
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

  static async updateNote(params: UpdateNoteParams): Promise<NoteWithContent> {
    if (!params.noteId) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    const { noteId, ...fields } = params;

    try {
      const response = await ApiClient.patch<any>(`${this.BASE_PATH}/note/${noteId}/`, fields);
      return transformNoteWithContent(response);
    } catch (error) {
      throw new NoteError(
        'Failed to update note',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  static async updateNoteTitle(params: UpdateNoteTitleParams): Promise<NoteWithContent> {
    return this.updateNote({ noteId: params.noteId, title: params.title });
  }

  /**
   * Makes a note private
   * @param noteId - The ID of the note to make private
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async makePrivate(noteId: ID): Promise<Note> {
    if (!noteId) {
      throw new NoteError('Missing note ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/note/${noteId}/make_private/`);
      return transformNote(response);
    } catch (error) {
      throw new NoteError(
        'Failed to make note private',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Updates the permissions for a note
   * @param noteId - The ID of the note to update permissions for
   * @param organizationId - The ID of the organization
   * @param accessType - The access type to set (defaults to "ADMIN")
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async updateNotePermissions(
    noteId: ID,
    organizationId: ID,
    accessType: string = 'ADMIN'
  ): Promise<boolean> {
    if (!noteId || !organizationId) {
      throw new NoteError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.patch<any>(`${this.BASE_PATH}/note/${noteId}/update_permissions/`, {
        access_type: accessType,
        organization: organizationId,
      });
      return true;
    } catch (error) {
      throw new NoteError(
        'Failed to update note permissions',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
