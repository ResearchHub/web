'use client';

import { useCallback, useEffect, useRef } from 'react';
import { debounce, DebouncedFunc } from 'lodash-es';
import { NoteError, NoteService } from '@/services/note.service';
import { mergeNoteDetails, type NoteDetailsDraft } from '@/types/note';
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
  const pendingByNoteIdRef = useRef(new Map<NonNullable<ID>, NoteDetailsDraft>());
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
        await NoteService.updateNote({ noteId: savingNoteId, details });
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

  const sendPendingDetails = useCallback(
    (savingNoteId: ID): Promise<boolean> => {
      return chain(async () => {
        if (savingNoteId == null) return true;

        // Claim this note's dirty set only when its queued save begins. That
        // lets a failed earlier request merge beneath every newer edit.
        const details = pendingByNoteIdRef.current.get(savingNoteId);
        if (!details) return true;
        pendingByNoteIdRef.current.delete(savingNoteId);

        const saved = await patchDetails(savingNoteId, details);
        if (!saved) {
          const retryableDetails =
            savingNoteId === openNoteIdRef.current ? keepWritableDetails(details) : details;
          const pendingDetails = pendingByNoteIdRef.current.get(savingNoteId) ?? {};
          if (Object.keys(retryableDetails).length > 0) {
            pendingByNoteIdRef.current.set(
              savingNoteId,
              mergeNoteDetails(retryableDetails, pendingDetails)
            );
          }
        }
        return saved;
      });
    },
    [chain, keepWritableDetails, patchDetails]
  );

  // Created once so every control shares one timer.
  const debouncedSave = useRef<DebouncedFunc<() => void>>(
    debounce(() => {
      void sendPendingDetails(openNoteIdRef.current);
    }, DEBOUNCE_MS)
  );

  const saveDetails = useCallback(
    (fields: NoteDetailsDraft, forNoteId?: ID) => {
      const savingNoteId = forNoteId ?? openNoteIdRef.current;
      if (savingNoteId == null) return;

      const details = savingNoteId === openNoteIdRef.current ? keepWritableDetails(fields) : fields;
      if (Object.keys(details).length === 0) return;

      const pendingDetails = pendingByNoteIdRef.current.get(savingNoteId) ?? {};
      pendingByNoteIdRef.current.set(savingNoteId, mergeNoteDetails(pendingDetails, details));

      // A late save belongs to its original note and should not wait for the
      // open note's debounce.
      if (savingNoteId !== openNoteIdRef.current) {
        void sendPendingDetails(savingNoteId);
        return;
      }
      debouncedSave.current();
    },
    [keepWritableDetails, sendPendingDetails]
  );

  const flushDetails = useCallback(() => {
    debouncedSave.current.cancel();
    return sendPendingDetails(openNoteIdRef.current);
  }, [sendPendingDetails]);

  const markPublished = useCallback(() => {
    isPublishedRef.current = true;
    const publishedNoteId = openNoteIdRef.current;
    if (publishedNoteId == null) return;

    const writableDetails = keepWritableDetails(
      pendingByNoteIdRef.current.get(publishedNoteId) ?? {}
    );
    if (Object.keys(writableDetails).length > 0) {
      pendingByNoteIdRef.current.set(publishedNoteId, writableDetails);
    } else {
      pendingByNoteIdRef.current.delete(publishedNoteId);
    }
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
    if (noteId != null && pendingByNoteIdRef.current.has(noteId)) {
      debouncedSave.current();
    }
  }, [noteId, sendPendingDetails]);

  useEffect(() => {
    return () => {
      // Give every note with retained work one last ordered save on unmount.
      debouncedSave.current.cancel();
      pendingByNoteIdRef.current.forEach((_details, pendingNoteId) => {
        void sendPendingDetails(pendingNoteId);
      });
    };
  }, [sendPendingDetails]);

  return { saveDetails, flushDetails, markPublished };
};
