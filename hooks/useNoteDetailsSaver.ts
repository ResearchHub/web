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
 * The single writer for a notebook draft's Details. A burst of edits becomes
 * one request, and requests run in the order they were made so a slow save
 * cannot land on top of the edit that followed it.
 */
export const useNoteDetailsSaver = (noteId?: number): NoteDetailsSaver => {
  const queuedDetailsRef = useRef<QueuedNoteDetails | null>(null);
  const lastSaveRef = useRef<Promise<void>>(Promise.resolve());

  const sendQueuedDetails = useCallback((): Promise<void> => {
    const queued = queuedDetailsRef.current;
    queuedDetailsRef.current = null;
    if (!queued) return lastSaveRef.current;

    const save = lastSaveRef.current.then(async () => {
      try {
        await NoteService.updateNote({ noteId: queued.noteId, details: queued.details });
      } catch (error) {
        // The form still holds the value, so the next edit to it saves again.
        console.error('Error saving note details:', error);
      }
    });
    lastSaveRef.current = save;
    return save;
  }, []);

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

  // Leaving the notebook must not cost the user the edits still inside the debounce.
  useEffect(() => {
    return () => {
      void saveDetailsNow();
    };
  }, [saveDetailsNow]);

  return { saveDetailsSoon, saveDetailsNow };
};
