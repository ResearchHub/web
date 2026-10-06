'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import { NoteError, NoteService } from '@/services/note.service';
import type { NoteWithContent } from '@/types/note';
import {
  isActiveExecutionStatus,
  type ChatExecution,
  type ChatStreamItem,
  type ChatNoteRef,
  type AgentChat,
} from '@/types/agentChat';

export type DocumentStatus =
  /** No document is open: the pane has nothing to show. */
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
  /**
   * The note's title as it stands: what it loaded with, or what the user has
   * renamed it to since. Empty while it is not known yet.
   */
  readonly title: string;
  /** Shows a new title at once. Saving it is the caller's, through the note's details writer. */
  readonly rename: (title: string) => void;
  /** When the note was last changed, as far as this pane knows. */
  readonly updatedDate: string | null;
  /**
   * The note as fetched again after the assistant worked on it, which may
   * have renamed it or filled in its details on the server. Null until then.
   */
  readonly details: NoteWithContent | null;
  readonly loading: boolean;
  readonly error: string | null;
  /** The note does not exist (any more). */
  readonly missing: boolean;
  readonly status: DocumentStatus;
  /**
   * The assistant has written at least one version: the loaded note had one,
   * or the chat's activity reports a succeeded edit_note since.
   */
  readonly hasWrittenVersion: boolean;
  /** Prose of the `edit_note` call being composed, paragraphs split by blank lines. */
  readonly draftText: string | null;
  readonly draftBlocks: JSONContent[] | null;
  readonly draftKey: string;
  /** What the assistant is doing, for the in-progress row when there is no draft. */
  readonly phaseLabel: string | null;
  /** Deep link to the note in the notebook, once its organization is known. */
  readonly reload: () => void;
}

interface UseAIModeDocumentOptions {
  readonly note: ChatNoteRef | null;
  readonly chat: AgentChat | null;
  readonly latestExecution: ChatExecution | null;
  /** The assistant has a turn running on this document, in any of its chats. */
  readonly assistantWorking: boolean;
}

/** Any succeeded `edit_note` in the chat carries the version it produced. */
function chatHasEditedNote(chat: AgentChat | null): boolean {
  return (chat?.executions ?? []).some((execution) =>
    (execution.activity ?? []).some(
      (item) =>
        item.type === 'tool_call' && item.status === 'succeeded' && item.note_version_id != null
    )
  );
}

/** The `edit_note` draft the active turn is composing, if any. */
function currentEditDraft(
  execution: ChatExecution | null
): Extract<ChatStreamItem, { type: 'tool_draft' }> | null {
  if (execution == null || !isActiveExecutionStatus(execution.status)) return null;
  const items = execution.stream?.items ?? [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item.type === 'tool_draft' && item.tool === 'edit_note') {
      return item;
    }
  }
  return null;
}

/**
 * The open document: loads it for the editor and derives the pane's state
 * from the active turn. Keeping the document current as the assistant writes
 * is the review hook's job (see useNoteAgentReview), which splices each new
 * version into the live editor instead of reloading it.
 */
export function useAIModeDocument({
  note,
  chat,
  latestExecution,
  assistantWorking,
}: UseAIModeDocumentOptions): AIModeDocument {
  const noteId = note?.id ?? null;
  const [loadedContent, setContent] = useState<NoteWithContent | null>(null);
  const [loadedDetails, setDetails] = useState<NoteWithContent | null>(null);
  // Right after a switch, until the reset below has run, these still hold
  // the previous note: nothing of it may be shown or saved as this one's.
  const content = loadedContent?.id === noteId ? loadedContent : null;
  const details = loadedDetails?.id === noteId ? loadedDetails : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  // Kept beside the loaded note rather than written into it: the editor and
  // the review are seeded from that object and must not see it change.
  const [renamed, setRenamed] = useState<{ noteId: number; title: string } | null>(null);
  // The title the server last reported, to tell a rename made there (by the
  // assistant) from a stale copy of one the user made here and is saving.
  const serverTitleRef = useRef<string | null>(null);
  const seqRef = useRef(0);

  const fetchNote = useCallback(async () => {
    if (noteId == null) return;
    const seq = ++seqRef.current;
    setLoading(true);
    try {
      const fetched = await NoteService.getNote(String(noteId));
      if (seq !== seqRef.current) return;
      serverTitleRef.current = fetched.title;
      setContent(fetched);
      setError(null);
      setMissing(false);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(err instanceof Error ? err.message : 'Couldn’t load the document.');
      setMissing(err instanceof NoteError && err.status === 404);
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [noteId]);

  // Reset and load whenever the note changes.
  useEffect(() => {
    seqRef.current += 1;
    serverTitleRef.current = null;
    setContent(null);
    setDetails(null);
    setError(null);
    setMissing(false);
    setLoading(noteId != null);
    if (noteId != null) fetchNote();
  }, [noteId, fetchNote]);

  // A turn on this document settled. The assistant may have renamed it or
  // filled in its details, on the server: fetch them again for the masthead,
  // the top bar and the sidebar. The loaded note itself is left alone; the
  // editor's content arrives through the review.
  const detailsSeqRef = useRef(0);
  const refreshDetails = useCallback(async () => {
    if (noteId == null) return;
    const seq = ++detailsSeqRef.current;
    try {
      const fetched = await NoteService.getNote(String(noteId));
      if (seq !== detailsSeqRef.current) return;
      setDetails(fetched);
      if (fetched.title !== serverTitleRef.current) {
        serverTitleRef.current = fetched.title;
        setRenamed({ noteId, title: fetched.title });
      }
    } catch {
      // The details shown stay as they are until the next turn settles.
    }
  }, [noteId]);
  useEffect(() => {
    detailsSeqRef.current += 1;
  }, [noteId]);
  const wasWorkingRef = useRef(assistantWorking);
  useEffect(() => {
    const wasWorking = wasWorkingRef.current;
    wasWorkingRef.current = assistantWorking;
    if (wasWorking && !assistantWorking) void refreshDetails();
  }, [assistantWorking, refreshDetails]);

  const draft = currentEditDraft(latestExecution);
  const draftText = draft?.text || null;
  const draftBlocks = Array.isArray(draft?.blocks) ? draft.blocks : null;
  const draftKey = `${latestExecution?.stream?.id}:${draft?.id}`;
  const turnActive = latestExecution != null && isActiveExecutionStatus(latestExecution.status);
  const phaseLabel = turnActive ? (latestExecution?.phase?.label ?? null) : null;

  const hasWrittenVersion = (content != null && content.versionId > 0) || chatHasEditedNote(chat);

  const rename = useCallback(
    (title: string) => {
      if (noteId != null) setRenamed({ noteId, title });
    },
    [noteId]
  );
  const title = (
    (renamed?.noteId === noteId ? renamed?.title : null) ??
    content?.title ??
    note?.title ??
    ''
  ).trim();

  const status: DocumentStatus = useMemo(() => {
    if (noteId == null) return 'absent';
    if (draftText != null) return 'drafting';
    if (turnActive) return 'working';
    if (content != null && !hasWrittenVersion) return 'empty';
    return 'settled';
  }, [noteId, draftText, turnActive, content, hasWrittenVersion]);

  return {
    note,
    content,
    title,
    rename,
    updatedDate: details?.updatedDate ?? content?.updatedDate ?? null,
    details,
    loading,
    error,
    missing,
    status,
    hasWrittenVersion,
    draftText,
    draftBlocks,
    draftKey,
    phaseLabel,
    reload: fetchNote,
  };
}
