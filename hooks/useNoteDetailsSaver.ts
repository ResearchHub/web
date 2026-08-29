'use client';

import { useCallback, useEffect, useRef } from 'react';
import { debounce, DebouncedFunc } from 'lodash-es';
import { NoteError, NoteService } from '@/services/note.service';
import type { NoteDetailsDraft } from '@/types/note';
import { ID } from '@/types/root';

const DEBOUNCE_MS = 2000;

export interface NoteDetailsSaver {
  /**
   * Mark fields dirty and schedule the one debounced write. `forNoteId` names
   * the note the fields belong to when that may no longer be the open one.
   */
  saveDetails: (fields: NoteDetailsDraft, forNoteId?: ID) => void;
  /** Send anything still pending now, and report whether the note is up to date. */
  flushDetails: () => Promise<boolean>;
  /** The note has a post now, so the writer keeps only what publishing leaves writable. */
  markPublished: () => void;
}

interface UseNoteDetailsSaverOptions {
  /** Reports the note the title belongs to, since a save can land after the user moved on. */
  onTitleSaved?: (title: string, noteId: ID) => void;
}

const isPublishedConflict = (error: unknown): boolean =>
  error instanceof NoteError && error.status === 409;

/**
 * The one debounced writer to `PATCH /api/note/{id}/`.
 *
 * Every Details control marks its fields dirty here, so a burst of edits
 * becomes a single request. Saves reach the server strictly in the order they
 * were requested, mirroring the content saver in `useNote`: an in-flight
 * request cannot be recalled, and letting a later one overtake it would commit
 * the older values last.
 */
export const useNoteDetailsSaver = (
  noteId: ID,
  options: UseNoteDetailsSaverOptions = {}
): NoteDetailsSaver => {
  const pendingRef = useRef<NoteDetailsDraft>({});
  const isPublishedRef = useRef(false);
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());

  const onTitleSavedRef = useRef(options.onTitleSaved);
  onTitleSavedRef.current = options.onTitleSaved;

  // The open note, held in a ref because the layout outlives the note it shows.
  const openNoteIdRef = useRef(noteId);
  openNoteIdRef.current = noteId;

  /**
   * A published note answers 409 to every shared key, so those stop being
   * written. `title` is exempt — the backend leaves renaming open after
   * publish — so a rename keeps riding the same writer as everything else.
   */
  const keepWritableDetails = useCallback((details: NoteDetailsDraft): NoteDetailsDraft => {
    if (!isPublishedRef.current) return details;
    return 'title' in details ? { title: details.title } : {};
  }, []);

  /** Runs after whatever is already in flight, so saves land in request order. */
  const chain = useCallback(<T>(work: () => Promise<T>): Promise<T> => {
    const run = saveChainRef.current.catch(() => undefined).then(work);
    saveChainRef.current = run;
    return run;
  }, []);

  const patchDetails = useCallback(
    async (savingNoteId: ID, details: NoteDetailsDraft): Promise<boolean> => {
      try {
        await NoteService.updateNote({
          noteId: savingNoteId,
          selectedGrantId: undefined,
          details,
        });
        if (details.title !== undefined) {
          onTitleSavedRef.current?.(details.title, savingNoteId);
        }
        return true;
      } catch (error) {
        console.error('Error saving note details:', error);
        if (isPublishedConflict(error) && savingNoteId === openNoteIdRef.current) {
          isPublishedRef.current = true;
        }
        return false;
      }
    },
    []
  );

  const hasPendingDetails = useCallback(() => Object.keys(pendingRef.current).length > 0, []);

  const sendPendingDetails = useCallback(
    (savingNoteId: ID): Promise<boolean> => {
      if (savingNoteId == null || !hasPendingDetails()) {
        // Nothing of this call's own to send, so report on what is in flight.
        return chain(async () => !hasPendingDetails());
      }

      // Claim the dirty set now, so edits made while this request is in flight
      // belong to the next save rather than being dropped or sent twice.
      const details = pendingRef.current;
      pendingRef.current = {};

      return chain(async () => {
        const saved = await patchDetails(savingNoteId, details);
        if (!saved) {
          // Keep whatever is still writable dirty, so a later save carries it
          // without undoing anything edited while this request was in flight.
          pendingRef.current = { ...keepWritableDetails(details), ...pendingRef.current };
        }
        return saved;
      });
    },
    [chain, hasPendingDetails, keepWritableDetails, patchDetails]
  );

  // Created once so every control shares one timer.
  const debouncedSave = useRef<DebouncedFunc<() => void>>(
    debounce(() => {
      void sendPendingDetails(openNoteIdRef.current);
    }, DEBOUNCE_MS)
  );

  const saveDetails = useCallback(
    (fields: NoteDetailsDraft, forNoteId?: ID) => {
      const details = keepWritableDetails(fields);
      if (Object.keys(details).length === 0) return;

      // A late save — the editor flushing a rename after the user moved on —
      // belongs to its own note, never to the one now open.
      if (forNoteId != null && forNoteId !== openNoteIdRef.current) {
        void chain(() => patchDetails(forNoteId, details));
        return;
      }
      pendingRef.current = { ...pendingRef.current, ...details };
      debouncedSave.current();
    },
    [chain, keepWritableDetails, patchDetails]
  );

  const flushDetails = useCallback(() => {
    debouncedSave.current.cancel();
    return sendPendingDetails(openNoteIdRef.current);
  }, [sendPendingDetails]);

  const markPublished = useCallback(() => {
    isPublishedRef.current = true;
    pendingRef.current = keepWritableDetails(pendingRef.current);
  }, [keepWritableDetails]);

  // A pending write belongs to the note that was open when it was made, so
  // send it before the notebook moves on rather than dropping those edits.
  const previousNoteIdRef = useRef(noteId);
  useEffect(() => {
    const previousNoteId = previousNoteIdRef.current;
    previousNoteIdRef.current = noteId;
    if (previousNoteId == null || previousNoteId === noteId) return;

    debouncedSave.current.cancel();
    void sendPendingDetails(previousNoteId);
    isPublishedRef.current = false;
  }, [noteId, sendPendingDetails]);

  useEffect(() => {
    return () => {
      // Unmounting with a save still scheduled: persist it rather than drop
      // the user's last edits.
      debouncedSave.current.flush();
    };
  }, []);

  return { saveDetails, flushDetails, markPublished };
};
