import { ApiClient } from './client';
import {
  buildNoteDetailsPayload,
  transformNote,
  transformNoteContent,
  transformNoteWithContent,
} from '@/types/note';
import type {
  Note,
  NoteAccess,
  NoteContent,
  NoteDetailsUpdate,
  NoteWithContent,
} from '@/types/note';
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
  selectedGrantId?: ID;
  details?: NoteDetailsUpdate;
}

export type OrganizationNoteDocumentType =
  | 'PREREGISTRATION'
  | 'GRANT'
  | 'DISCUSSION'
  | 'REGISTERED_REPORT';

export interface GetOrganizationNotesParams {
  status?: 'DRAFT' | 'PUBLISHED';
  /** One type, or several in one request. */
  documentType?: OrganizationNoteDocumentType | readonly OrganizationNoteDocumentType[];
  /** Latest edit first; servers that don't know it keep their newest-created order. */
  ordering?: '-updated_date';
  nextUrl?: string;
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
      if (params?.documentType) {
        const types = Array.isArray(params.documentType)
          ? params.documentType
          : [params.documentType];
        if (types.length > 0) queryParams.append('type', types.join(','));
      }
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      const qs = queryParams.toString();

      const url =
        params?.nextUrl ??
        `${this.BASE_PATH}/organization/${orgSlug}/get_organization_notes/${qs ? `?${qs}` : ''}`;

      const response = await ApiClient.get<any>(url);

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
        extractApiErrorMessage(error, 'Failed to create note'),
        undefined,
        error instanceof ApiError ? error.status : undefined
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
   * Fetches one specific content version of a note. Readable with the note's
   * read permission, so it works even when newer autosaves exist — e.g. to
   * load the assistant's exact version behind the conflict banner's Reload.
   * @throws {NoteError} When the request fails or parameters are invalid
   */
  static async getNoteVersion(versionId: number): Promise<NoteContent> {
    if (!versionId) {
      throw new NoteError('Missing note version ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(`${this.BASE_PATH}/note_content/${versionId}/`);
      return transformNoteContent(response);
    } catch (error) {
      throw new NoteError(
        extractApiErrorMessage(error, 'Failed to fetch note version'),
        undefined,
        error instanceof ApiError ? error.status : undefined
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

    const { noteId, selectedGrantId, details } = params;
    const payload = {
      ...(selectedGrantId === undefined ? {} : { selected_grant: selectedGrantId }),
      ...(details && buildNoteDetailsPayload(details)),
    };

    try {
      const response = await ApiClient.patch<any>(`${this.BASE_PATH}/note/${noteId}/`, payload);
      return transformNoteWithContent(response);
    } catch (error) {
      throw new NoteError(
        extractApiErrorMessage(error, 'Failed to update note'),
        undefined,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }
}
