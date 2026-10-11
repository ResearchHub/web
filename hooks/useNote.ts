import { useState, useEffect, useCallback, useRef } from 'react';
import { NoteService, NoteError, type NoteInvitePreview } from '@/services/note.service';
import { isChangelogNote, type Note, type NoteAccess, type NoteContent } from '@/types/note';
import { ID } from '@/types/root';
import { Editor } from '@tiptap/react';
import { getHTMLFromFragment, getText, getTextSerializersFromSchema } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { debounce, DebouncedFunc } from 'lodash-es';
import { getDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import { mergeRegisteredReportPrefill } from '@/utils/registeredReportPrefill';

export interface UseNoteOptions {
  sendImmediately?: boolean;
}

interface UseNoteInviteState {
  invite: NoteInvitePreview | null;
  isLoading: boolean;
  error: Error | null;
}

type FetchNoteInviteFn = (inviteKey: string) => Promise<NoteInvitePreview>;
type UseNoteInviteReturn = [UseNoteInviteState, FetchNoteInviteFn];

export function useNoteInvite(): UseNoteInviteReturn {
  const [invite, setInvite] = useState<NoteInvitePreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvite = useCallback(async (inviteKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const inviteData = await NoteService.getNoteByInviteKey(inviteKey);
      setInvite(inviteData);
      return inviteData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch invited note');
      setError(error);
      setInvite(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ invite, isLoading, error }, fetchInvite];
}

interface UseAcceptNoteInviteState {
  isLoading: boolean;
  error: Error | null;
}

type AcceptNoteInviteFn = (inviteKey: string) => Promise<boolean>;
type UseAcceptNoteInviteReturn = [UseAcceptNoteInviteState, AcceptNoteInviteFn];

export function useAcceptNoteInvite(): UseAcceptNoteInviteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const acceptInvite = useCallback(async (inviteKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      return await NoteService.acceptNoteInvite(inviteKey);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept note invitation');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ isLoading, error }, acceptInvite];
}

interface CreateNoteInput {
  title: string;
  grouping: NoteAccess;
  organizationSlug: string;
  documentType?: string;
}

interface UseCreateNoteState {
  note: Note | null;
  isLoading: boolean;
  error: Error | null;
}

type CreateNoteFn = (params: CreateNoteInput) => Promise<Note>;
type UseCreateNoteReturn = [UseCreateNoteState, CreateNoteFn];

export const useCreateNote = (): UseCreateNoteReturn => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNote = async (params: CreateNoteInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.createNote({
        title: params.title,
        grouping: params.grouping,
        organization_slug: params.organizationSlug,
        document_type: params.documentType,
      });
      setNote(response);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to create note';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ note, isLoading, error }, createNote];
};

interface UseNoteContentState {
  note: NoteContent | null;
  isLoading: boolean;
  error: Error | null;
}

interface UpdateNoteContentInput {
  note: ID;
  fullSrc?: string;
  plainText?: string;
  fullJson?: string;
}

type UpdateNoteContentFn = (params: UpdateNoteContentInput) => Promise<NoteContent>;
type UseNoteContentReturn = [UseNoteContentState, UpdateNoteContentFn];

export const useNoteContent = (): UseNoteContentReturn => {
  const [note, setNote] = useState<NoteContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateNoteContent = async (params: UpdateNoteContentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.updateNoteContent({
        note: params.note,
        full_src: params.fullSrc,
        plain_text: params.plainText,
        full_json: params.fullJson,
      });
      setNote(response);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to update note content';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ note, isLoading, error }, updateNoteContent];
};

interface UseDeleteNoteState {
  isLoading: boolean;
  error: Error | null;
}

type DeleteNoteFn = (noteId: ID) => Promise<Note>;
type UseDeleteNoteReturn = [UseDeleteNoteState, DeleteNoteFn];

export const useDeleteNote = (): UseDeleteNoteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteNote = async (noteId: ID) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.deleteNote(noteId);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to delete note';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, deleteNote];
};

interface UseUpdateNoteState {
  isLoading: boolean;
  error: Error | null;
}

interface UpdateNoteOptions {
  /**
   * Persists the document's title, which is a note field rather than note
   * content and so belongs to whichever writer owns the note record.
   */
  saveTitle?: (newTitle: string) => void;
  /**
   * Reports the note the title belongs to: a save can complete (or a pending
   * autosave flush) after the user moved to another note, so consumers must
   * scope their state updates to `noteId` rather than whatever is current.
   */
  onTitleUpdate?: (newTitle: string, noteId: ID) => void;
  debounceMs?: number;
  registeredReportProposalId?: number | null;
  /**
   * The document a save should persist, when it isn't the editor's current
   * one — the notebook uses this to strip in-note review content (assistant
   * diff ranges pending a decision) out of saves. Defaults to the editor's
   * live document.
   */
  docToPersist?: (editor: Editor) => ProseMirrorNode;
}

type UpdateNoteFn = (editor: Editor) => void;
type SaveNoteNowFn = (editor: Editor) => Promise<boolean>;
type UseUpdateNoteReturn = [UseUpdateNoteState, UpdateNoteFn, SaveNoteNowFn];

/**
 * A save serialized at the moment it was requested. Queued saves upload
 * this frozen payload rather than re-reading the editor, whose document may
 * have moved on (e.g. into a new review) by the time the chain gets there.
 */
interface NoteSavePayload {
  readonly json: unknown;
  readonly html: string;
  readonly plainText: string;
  readonly title: string;
}

export const useUpdateNote = (noteId: ID, options: UpdateNoteOptions = {}): UseUpdateNoteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const titleRef = useRef<string>('');

  const buildSavePayload = (
    editor: Editor,
    registeredReportProposalId?: number | null
  ): NoteSavePayload => {
    // Serialize from the persistable document, which may differ from the
    // editor's live one (see UpdateNoteOptions.docToPersist).
    const doc = options.docToPersist?.(editor) ?? editor.state.doc;
    const json = mergeRegisteredReportPrefill(doc.toJSON(), registeredReportProposalId);
    return {
      json,
      html: getHTMLFromFragment(doc.content, editor.schema),
      plainText: getText(doc, {
        blockSeparator: '\n\n',
        textSerializers: getTextSerializersFromSchema(editor.schema),
      }),
      title: getDocumentTitle(json) || '',
    };
  };

  const performSave = async (payload: NoteSavePayload, noteId: ID): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // The title goes to the note record's own writer, which queues it and
      // retries it on its own; only a change to it is worth sending.
      if (payload.title !== titleRef.current) {
        titleRef.current = payload.title;
        options.saveTitle?.(payload.title);
        options.onTitleUpdate?.(payload.title, noteId);
      }

      await NoteService.updateNoteContent({
        note: noteId,
        full_src: payload.html || '',
        plain_text: payload.plainText || '',
        full_json: JSON.stringify(payload.json),
      });
      return true;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to update note';
      const error = new Error(errorMsg);
      setError(error);
      console.error('Error updating note:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // The once-created debounce and queue route through refs so they always
  // run the current render's serialization and save (fresh options and
  // callbacks).
  const buildSavePayloadRef = useRef(buildSavePayload);
  buildSavePayloadRef.current = buildSavePayload;
  const performSaveRef = useRef(performSave);
  performSaveRef.current = performSave;

  // Saves reach the server strictly in the order they were requested.
  // cancel() cannot recall an autosave whose request is already in flight,
  // and an immediate save overtaking it would let the older payload commit
  // last — re-persisting content the user's action just superseded.
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());

  const queueSave = useCallback(
    (editor: Editor, noteId: ID, registeredReportProposalId?: number | null): Promise<boolean> => {
      if (!editor || !noteId) {
        console.error('Editor or noteId is undefined in queueSave', { editor, noteId });
        return Promise.resolve(false);
      }
      // Payload and save are both captured now, when the save is requested.
      // A queued save that serialized once its turn came could instead read
      // a review installed meanwhile (see docToPersist) and persist the side
      // the caller's action had just decided against; resolving the save fn
      // late would likewise report through whichever note's callbacks
      // (onTitleUpdate) the still-mounted layout holds by then.
      const payload = buildSavePayloadRef.current(editor, registeredReportProposalId);
      const save = performSaveRef.current;
      const run = saveChainRef.current.catch(() => undefined).then(() => save(payload, noteId));
      saveChainRef.current = run;
      return run;
    },
    []
  );

  // The one debouncer serves whichever note the still-mounted layout shows,
  // so a pending autosave may belong to a note the user already left. That
  // write must not be discarded: scheduling or superseding only owns the
  // same note's pending save — a foreign one is flushed first, persisting
  // its edits in request order ahead of the new work.
  const pendingSaveNoteIdRef = useRef<ID | null>(null);

  const debouncedUpdate = useRef<
    DebouncedFunc<(editor: Editor, noteId: ID, registeredReportProposalId?: number | null) => void>
  >(
    debounce((editor: Editor, noteId: ID, registeredReportProposalId?: number | null) => {
      pendingSaveNoteIdRef.current = null;
      void queueSave(editor, noteId, registeredReportProposalId);
    }, options.debounceMs ?? 2000)
  );

  const flushForeignPendingSave = useCallback((noteId: ID) => {
    if (pendingSaveNoteIdRef.current != null && pendingSaveNoteIdRef.current !== noteId) {
      debouncedUpdate.current.flush();
    }
  }, []);

  const updateNote = useCallback(
    (editor: Editor) => {
      if (!editor) {
        console.error('Editor is undefined in updateNote');
        return;
      }
      flushForeignPendingSave(noteId);
      pendingSaveNoteIdRef.current = noteId;
      debouncedUpdate.current(editor, noteId, options.registeredReportProposalId);
    },
    [noteId, options.registeredReportProposalId, flushForeignPendingSave]
  );

  /**
   * Persist immediately and report success — for moments where the save is
   * itself the user's action (keeping their version over an assistant's) and
   * a debounced fire-and-forget write would let the UI acknowledge a choice
   * the server never heard about. Cancels any autosave scheduled for this
   * note (its own save supersedes it) and queues behind any in-flight one.
   */
  const saveNoteNow = useCallback(
    (editor: Editor): Promise<boolean> => {
      flushForeignPendingSave(noteId);
      debouncedUpdate.current.cancel();
      pendingSaveNoteIdRef.current = null;
      return queueSave(editor, noteId, options.registeredReportProposalId);
    },
    [noteId, options.registeredReportProposalId, queueSave, flushForeignPendingSave]
  );

  useEffect(() => {
    return () => {
      // Unmounting with an autosave still scheduled: persist it rather than
      // drop the user's last edits.
      debouncedUpdate.current.flush();
    };
  }, []);

  return [{ isLoading, error }, updateNote, saveNoteNow];
};

interface UseDuplicateNoteState {
  isLoading: boolean;
  error: Error | null;
}

type DuplicateNoteFn = (noteId: string, organizationSlug: string) => Promise<Note>;
type UseDuplicateNoteReturn = [UseDuplicateNoteState, DuplicateNoteFn];

export const useDuplicateNote = (): UseDuplicateNoteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const duplicateNote = async (noteId: string, organizationSlug: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the original note with content
      const originalNote = await NoteService.getNote(noteId);

      // 2. Create a new note with the same title
      const newNote = await NoteService.createNote({
        title: `${originalNote.title} (Copy)`,
        grouping: originalNote.access,
        organization_slug: organizationSlug,
        document_type: isChangelogNote(originalNote) ? 'DISCUSSION' : undefined,
      });

      // 3. Copy the content to the new note
      if (originalNote.content || originalNote.contentJson) {
        await NoteService.updateNoteContent({
          note: newNote.id,
          full_src: originalNote.content,
          plain_text: originalNote.plainText,
          full_json: originalNote.contentJson,
        });
      }

      return newNote;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to duplicate note';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, duplicateNote];
};
