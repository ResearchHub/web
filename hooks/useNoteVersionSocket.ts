'use client';

import { useMemo } from 'react';
import { WS_ROUTES } from '@/services/websocket';
import type { NoteVersionEvent } from '@/types/note';
import { useReconnectingSocket, type SocketStatus } from './useReconnectingSocket';

/**
 * Server-defined close codes that mean reconnecting is pointless for this
 * note: unauthenticated (4401), note missing or not visible (4404). The REST
 * note fetch remains the source of truth either way.
 */
const FATAL_CLOSE_CODES: ReadonlySet<number> = new Set([4401, 4404]);

interface UseNoteVersionSocketOptions {
  noteId: string | number | null;
  /** Connect only while the note is open in the editor. */
  enabled: boolean;
  /**
   * A version event arrived. Advisory and at-least-once: payloads carry ids
   * only, so duplicates and reordering must be harmless to the caller —
   * compare version ids, refetch what's needed.
   */
  onEvent: (event: NoteVersionEvent) => void;
  /**
   * Socket re-opened after a drop — events were missed, so the caller should
   * probe the note's head version to catch up.
   */
  onReconnect: () => void;
}

/**
 * Subscribes to one note's version events (`ws/notebook/notes/<id>/`): the
 * backend pushes `note_version_created` whenever any writer — editor
 * autosave, agent `edit_note`, system — commits a new content version. This
 * is how the editor learns the note changed underneath it without watching
 * every chat that might be editing.
 */
export function useNoteVersionSocket({
  noteId,
  enabled,
  onEvent,
  onReconnect,
}: UseNoteVersionSocketOptions): SocketStatus {
  const url = useMemo(() => (noteId != null ? WS_ROUTES.NOTE_VERSIONS(noteId) : null), [noteId]);

  return useReconnectingSocket({
    url,
    enabled: enabled && url != null,
    fatalCloseCodes: FATAL_CLOSE_CODES,
    // Frames on this channel are note version events by contract; the
    // consumer checks `type` itself so future event kinds stay harmless.
    onMessage: (data) => onEvent(data as NoteVersionEvent),
    onReconnect,
  });
}
