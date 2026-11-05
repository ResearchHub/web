'use client';

import { useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash-es';
import { NoteService } from '@/services/note.service';
import { mergeNoteDetailsUpdates, type NoteDetailsUpdate } from '@/types/note';

const DEBOUNCE_MS = 2000;

export interface NoteDetailsSaver {
  /** Queues an edit, combining it with the edits made alongside it. */
  saveDetailsSoon: (details: NoteDetailsUpdate) => void;
  /** Sends whatever is still queued without waiting for the debounce. */
  saveDetailsNow: () => Promise<void>;
}

/** A queued edit carries its note, so it follows the note it was made on. */
interface QueuedNoteDetails {
  noteId: number;
  details: NoteDetailsUpdate;
}

/**
 * The single writer for a note's own fields — the editor's title as much as the
 * publishing form's Details, which is why one instance is shared through
 * NotebookContext. A burst of edits becomes one request, and requests run in the
 * order they were made so a slow save cannot land on top of the edit after it.
 */
export const useNoteDetailsSaver = (noteId?: number): NoteDetailsSaver => {
  const queuedDetailsRef = useRef<QueuedNoteDetails | null>(null);
  const lastSaveRef = useRef<Promise<void>>(Promise.resolve());

  /**
   * Puts a failed edit back under anything queued since, so the next flush
   * retries it. Only an edit to the same field supersedes it, and an edit that
   * moved to another note has to be dropped: the two cannot share a request.
   */
  const requeueFailedDetails = useCallback((failed: QueuedNoteDetails) => {
    const queued = queuedDetailsRef.current;
    if (queued && queued.noteId !== failed.noteId) return;

    queuedDetailsRef.current = {
      noteId: failed.noteId,
      details: mergeNoteDetailsUpdates(failed.details, queued?.details ?? {}),
    };
  }, []);

  const sendQueuedDetails = useCallback((): Promise<void> => {
    const queued = queuedDetailsRef.current;
    queuedDetailsRef.current = null;
    if (!queued) return lastSaveRef.current;

    const save = lastSaveRef.current.then(async () => {
      try {
        await NoteService.updateNote({ noteId: queued.noteId, details: queued.details });
      } catch (error) {
        console.error('Error saving note details:', error);
        requeueFailedDetails(queued);
      }
    });
    lastSaveRef.current = save;
    return save;
  }, [requeueFailedDetails]);

  const sendQueuedDetailsSoon = useRef(
    debounce(() => void sendQueuedDetails(), DEBOUNCE_MS)
  ).current;

  const saveDetailsSoon = useCallback(
    (details: NoteDetailsUpdate) => {
      if (noteId == null) return;

      // An edit belonging to another note goes out first, under its own id.
      if (queuedDetailsRef.current && queuedDetailsRef.current.noteId !== noteId) {
        void sendQueuedDetails();
      }

      queuedDetailsRef.current = {
        noteId,
        details: mergeNoteDetailsUpdates(queuedDetailsRef.current?.details ?? {}, details),
      };
      sendQueuedDetailsSoon();
    },
    [noteId, sendQueuedDetails, sendQueuedDetailsSoon]
  );

  const saveDetailsNow = useCallback((): Promise<void> => {
    sendQueuedDetailsSoon.cancel();
    return sendQueuedDetails();
  }, [sendQueuedDetails, sendQueuedDetailsSoon]);

  // Leaving the notebook must not cost the user the edits still inside the
  // debounce. A closing or backgrounded tab never runs the cleanup below, so it
  // is flushed while the page is still alive enough to send the request.
  useEffect(() => {
    const flushOnHide = () => {
      if (document.visibilityState === 'hidden') void saveDetailsNow();
    };

    document.addEventListener('visibilitychange', flushOnHide);
    return () => {
      document.removeEventListener('visibilitychange', flushOnHide);
      void saveDetailsNow();
    };
  }, [saveDetailsNow]);

  return { saveDetailsSoon, saveDetailsNow };
};
