'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NoteService } from '@/services/note.service';
import type { NoteWithContent } from '@/types/note';
import {
  isActiveExecutionStatus,
  type ChatExecution,
  type ChatNoteRef,
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
  /**
   * The note as loaded for the editor: title, organization and the version
   * the editor was seeded with. Loaded once per note — later agent versions
   * reach the editor through the review, not through a reload here.
   */
  readonly content: NoteWithContent | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly status: DocumentStatus;
  /** Prose of the `edit_note` call being composed, paragraphs split by blank lines. */
  readonly draftText: string | null;
  /** What the assistant is doing, for the in-progress row when there is no draft. */
  readonly phaseLabel: string | null;
  /** Deep link to the note in the notebook, once its organization is known. */
  readonly notebookHref: string | null;
  readonly reload: () => void;
}

interface UseAIModeDocumentOptions {
  readonly note: ChatNoteRef | null;
  readonly latestExecution: ChatExecution | null;
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

/**
 * The document behind a conversation: loads it for the editor and derives
 * the pane's state from the active turn. Keeping the document current as the
 * assistant writes is the review hook's job (see useNoteAgentReview), which
 * splices each new version into the live editor instead of reloading it.
 */
export function useAIModeDocument({
  note,
  latestExecution,
}: UseAIModeDocumentOptions): AIModeDocument {
  const noteId = note?.id ?? null;
  const [content, setContent] = useState<NoteWithContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const fetchNote = useCallback(async () => {
    if (noteId == null) return;
    const seq = ++seqRef.current;
    setLoading(true);
    try {
      const fetched = await NoteService.getNote(String(noteId));
      if (seq !== seqRef.current) return;
      setContent(fetched);
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
    setContent(null);
    setError(null);
    setLoading(noteId != null);
    if (noteId != null) fetchNote();
  }, [noteId, fetchNote]);

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
    notebookHref,
    reload: fetchNote,
  };
}
