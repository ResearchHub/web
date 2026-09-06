'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NoteService } from '@/services/note.service';
import { useNoteVersionSocket } from '@/hooks/useNoteVersionSocket';
import { NOTE_VERSION_CREATED, type NoteVersionEvent, type NoteWithContent } from '@/types/note';
import {
  isActiveExecutionStatus,
  type ChatExecution,
  type ChatNoteRef,
  type NotebookChat,
} from '@/types/notebookChat';

export type DocumentStatus =
  /** No note on this conversation: the pane has nothing to show. */
  | 'absent'
  /** The note exists but the agent hasn't written a version yet. */
  | 'empty'
  /** A turn is running and the model is composing an `edit_note` right now. */
  | 'drafting'
  /** A turn is running with no draft streaming (other providers, or between edits). */
  | 'working'
  /** No turn running: content only. */
  | 'settled';

export interface AIModeDocument {
  readonly note: ChatNoteRef | null;
  readonly content: NoteWithContent | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly status: DocumentStatus;
  /** Prose of the `edit_note` call being composed, paragraphs split by blank lines. */
  readonly draftText: string | null;
  /** What the assistant is doing, for the in-progress row when there is no draft. */
  readonly phaseLabel: string | null;
  /** Heading count in the settled document, plus one for an open draft. */
  readonly sectionCount: number;
  /** Deep link to the note in the notebook, once its organization is known. */
  readonly notebookHref: string | null;
  readonly refetch: () => void;
}

interface UseAIModeDocumentOptions {
  readonly note: ChatNoteRef | null;
  readonly chat: NotebookChat | null;
  readonly latestExecution: ChatExecution | null;
}

/** Highest note version any succeeded `edit_note` in the chat reports. */
function maxEditedVersion(chat: NotebookChat | null): number | null {
  let max: number | null = null;
  for (const execution of chat?.executions ?? []) {
    for (const item of execution.activity ?? []) {
      if (
        item.type === 'tool_call' &&
        item.status === 'succeeded' &&
        item.note_version_id != null
      ) {
        max = max == null ? item.note_version_id : Math.max(max, item.note_version_id);
      }
    }
  }
  return max;
}

/** The `edit_note` draft the active turn is composing, if any. */
function currentEditDraft(execution: ChatExecution | null): string | null {
  if (execution == null || !isActiveExecutionStatus(execution.status)) return null;
  const items = execution.stream?.items ?? [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item.type === 'tool_draft' && item.tool === 'edit_note') {
      return item.text.length > 0 ? item.text : null;
    }
  }
  return null;
}

/** Level 1 and 2 headings are sections; deeper ones are their subdivisions. */
const SECTION_HEADING_LEVELS = new Set([1, 2]);

function countSections(contentJson: string | undefined): number {
  if (!contentJson) return 0;
  try {
    const parsed: unknown = JSON.parse(contentJson);
    const blocks =
      parsed != null &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { content?: unknown }).content)
        ? ((parsed as { content: unknown[] }).content as {
            type?: string;
            attrs?: { level?: number };
          }[])
        : [];
    return blocks.filter(
      (block) => block?.type === 'heading' && SECTION_HEADING_LEVELS.has(block.attrs?.level ?? 1)
    ).length;
  } catch {
    return 0;
  }
}

/**
 * The document behind a conversation: its content, kept current from both
 * the chat's own activity (succeeded `edit_note` versions) and the note's
 * version socket, plus the live draft while a section is being written.
 */
export function useAIModeDocument({
  note,
  chat,
  latestExecution,
}: UseAIModeDocumentOptions): AIModeDocument {
  const noteId = note?.id ?? null;
  const [content, setContent] = useState<NoteWithContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Version we hold, and the newest we've heard exists — comparisons read the
  // refs so socket bursts and activity merges don't race the render.
  const heldVersionRef = useRef<number>(0);
  const seqRef = useRef(0);

  const fetchNote = useCallback(async () => {
    if (noteId == null) return;
    const seq = ++seqRef.current;
    setLoading(true);
    try {
      const fetched = await NoteService.getNote(String(noteId));
      if (seq !== seqRef.current) return;
      // A stale response (older version than one already applied) must not
      // roll the document back.
      if (fetched.versionId >= heldVersionRef.current) {
        heldVersionRef.current = fetched.versionId;
        setContent(fetched);
      }
      setError(null);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(err instanceof Error ? err.message : 'Couldn’t load the document.');
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [noteId]);

  // Reset and load whenever the note changes.
  useEffect(() => {
    seqRef.current += 1;
    heldVersionRef.current = 0;
    setContent(null);
    setError(null);
    setLoading(noteId != null);
    if (noteId != null) fetchNote();
  }, [noteId, fetchNote]);

  const refetchIfNewer = useCallback(
    (versionId: number | null | undefined) => {
      if (versionId == null) return;
      if (versionId > heldVersionRef.current) fetchNote();
    },
    [fetchNote]
  );

  // Signal 1: the chat's durable activity reports a newer edited version.
  const editedVersion = maxEditedVersion(chat);
  useEffect(() => {
    refetchIfNewer(editedVersion);
  }, [editedVersion, refetchIfNewer]);

  // Signal 2: the note's own version socket, whoever wrote the version.
  const handleVersionEvent = useCallback(
    (event: NoteVersionEvent) => {
      if (event.type !== NOTE_VERSION_CREATED || event.note_id !== noteId) return;
      refetchIfNewer(event.version_id);
    },
    [noteId, refetchIfNewer]
  );
  useNoteVersionSocket({
    noteId,
    enabled: noteId != null,
    onEvent: handleVersionEvent,
    onReconnect: fetchNote,
  });

  const draftText = currentEditDraft(latestExecution);
  const turnActive = latestExecution != null && isActiveExecutionStatus(latestExecution.status);
  const phaseLabel = turnActive ? (latestExecution?.phase?.label ?? null) : null;

  const status: DocumentStatus = useMemo(() => {
    if (noteId == null) return 'absent';
    if (draftText != null) return 'drafting';
    if (turnActive) return 'working';
    if (content != null && content.versionId === 0) return 'empty';
    return 'settled';
  }, [noteId, draftText, turnActive, content]);

  const sectionCount = useMemo(
    () => countSections(content?.contentJson) + (draftText != null ? 1 : 0),
    [content?.contentJson, draftText]
  );

  const notebookHref = useMemo(() => {
    const slug = content?.organization?.slug;
    return slug && noteId != null ? `/notebook/${slug}/${noteId}` : null;
  }, [content?.organization?.slug, noteId]);

  return {
    note,
    content,
    loading,
    error,
    status,
    draftText,
    phaseLabel,
    sectionCount,
    notebookHref,
    refetch: fetchNote,
  };
}
