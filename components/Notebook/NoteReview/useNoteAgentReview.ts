'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { DOMParser as ProseMirrorDOMParser, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { useNoteVersionSocket } from '@/hooks/useNoteVersionSocket';
import { NoteService } from '@/services/note.service';
import { NOTE_VERSION_CREATED } from '@/types/note';
import type { NotebookChat } from '@/types/notebookChat';
import { beginNoteDiffReview, endNoteDiffReview, resolveNoteDiffReview } from './noteDiffOverlay';

/** Highest note version produced by a succeeded edit_note in one chat. */
function maxAgentNoteVersion(chat: NotebookChat | null): number | null {
  let max: number | null = null;
  for (const execution of chat?.executions ?? []) {
    for (const item of execution.activity ?? []) {
      if (item.type === 'tool_call' && item.note_version_id != null) {
        max = max == null ? item.note_version_id : Math.max(max, item.note_version_id);
      }
    }
  }
  return max;
}

/** Parse a version's JSON document, falling back to its HTML source. */
function parseVersionContent(
  contentJson: string | undefined,
  contentSrc: string | undefined
): string | object {
  if (contentJson) {
    try {
      return JSON.parse(contentJson);
    } catch {
      // Malformed JSON — fall back to the HTML source.
    }
  }
  return contentSrc ?? '';
}

/**
 * Fetch the version a reload should apply: the pinned version when the banner
 * promised a specific assistant version, otherwise the note's latest. Both
 * serializations come back — which one the editor gets is decided against its
 * schema (see parseVersionForEditor).
 */
async function fetchReloadContent(
  noteId: string,
  pinnedVersionId: number | null
): Promise<{ contentJson?: string; contentSrc?: string; versionId: number | null }> {
  if (pinnedVersionId != null) {
    const version = await NoteService.getNoteVersion(pinnedVersionId);
    return { contentJson: version.json, contentSrc: version.src, versionId: pinnedVersionId };
  }
  const note = await NoteService.getNote(noteId);
  return {
    contentJson: note.contentJson,
    contentSrc: note.content,
    versionId: note.versionId ?? null,
  };
}

/**
 * Applying a fetched version isn't a user edit — emitUpdate=false so it never
 * triggers the notebook autosave.
 */
function applyEditorContent(editor: Editor | null, content: string | object): void {
  if (!editor || editor.isDestroyed) return;
  editor.commands.setContent(content, { emitUpdate: false });
}

/** Parse fetched version content into a schema node for diffing; null when unparseable. */
function parseIncomingNode(editor: Editor, content: string | object): ProseMirrorNode | null {
  try {
    if (typeof content === 'object') return editor.schema.nodeFromJSON(content);
    const container = document.createElement('div');
    container.innerHTML = content;
    return ProseMirrorDOMParser.fromSchema(editor.schema).parse(container);
  } catch {
    return null;
  }
}

/**
 * Parse a version for the editor: the schema node for diffing plus the
 * content a verbatim apply should use. JSON the schema rejects — an unknown
 * node from a newer serializer, say — falls back to the HTML source, which
 * the DOM parser degrades around where nodeFromJSON refuses outright.
 */
function parseVersionForEditor(
  editor: Editor,
  contentJson: string | undefined,
  contentSrc: string | undefined
): { node: ProseMirrorNode | null; content: string | object } {
  const content = parseVersionContent(contentJson, contentSrc);
  const node = parseIncomingNode(editor, content);
  if (node != null || typeof content === 'string' || !contentSrc) return { node, content };
  return { node: parseIncomingNode(editor, contentSrc), content: contentSrc };
}

/**
 * Verbatim-apply a fetched version: JSON when the schema accepts it, else
 * the HTML source (see parseVersionForEditor). Never a user edit.
 */
function applyVersionContent(
  editor: Editor | null,
  contentJson: string | undefined,
  contentSrc: string | undefined
): void {
  if (!editor || editor.isDestroyed) return;
  applyEditorContent(editor, parseVersionForEditor(editor, contentJson, contentSrc).content);
}

/** A running in-note review: the assistant version under decision and its live change count. */
export interface NoteAgentReview {
  readonly versionId: number;
  readonly changeCount: number;
}

export interface UseNoteAgentReviewOptions {
  /** The note the editor shows; null suspends everything. */
  readonly noteId: string | number | null;
  /** The live editor instance for that note, once mounted. */
  readonly editor: Editor | null;
  /**
   * The note as loaded into the editor — its id and the version it was
   * loaded with. The review compares agent versions against this held
   * version, and a new load resets the comparison.
   */
  readonly loadedNote: { readonly id: string | number; readonly versionId: number } | null;
  /**
   * The open chat, if any: its activity carries `note_version_id` on
   * succeeded `edit_note` calls, a belt-and-braces signal beside the socket.
   */
  readonly chat: NotebookChat | null;
  /**
   * Persist the editor's current document as a new server version, now, and
   * resolve with whether it reached the server. Needed when the user chose
   * "Keep mine" over an assistant version, or a reload applied an assistant
   * version that newer saves had buried — applying content programmatically
   * emits no editor update, so nothing else would save it.
   */
  readonly onPersistEditorState?: () => Promise<boolean>;
}

export interface UseNoteAgentReviewResult {
  readonly review: NoteAgentReview | null;
  /** Keep the assistant's side: deletes the struck ranges, keeps the rest. */
  readonly accept: () => void;
  /** Keep the reader's side: deletes the inserted ranges and persists it. */
  readonly reject: () => Promise<void>;
  /** Retry building the review for the newest assistant version. */
  readonly retryReview: () => Promise<void>;
  /** Escape hatch: apply the assistant version verbatim, no overlay. */
  readonly reloadWithoutReview: () => Promise<void>;
  /** Retry the choice-persisting save that failed. */
  readonly persistCurrentDoc: () => Promise<void>;
  /** The assistant's version couldn't be loaded or applied. */
  readonly reloadFailed: boolean;
  /** The editor shows the user's choice but the save behind it failed. */
  readonly persistFailed: boolean;
  readonly isReloading: boolean;
  readonly isPersisting: boolean;
}

/**
 * Keeps an editor in step with the versions an assistant writes to its note.
 *
 * A newer agent-authored version — heard from the note's version socket, the
 * open chat's activity, or a reconnect probe — becomes an in-note review
 * immediately: the document turns into the merge of both versions with the
 * overwritten content spliced back in as struck, still-editable text, and
 * Accept/Reject (or simply editing) resolve it. Saves made meanwhile go
 * through `noteDiffPersistableDoc`, so the server only ever sees the
 * accept-projection.
 *
 * Shared by the notebook's chat panel and the AI Mode document pane; the host
 * renders the controls and the failure banner wherever fits its layout.
 */
export function useNoteAgentReview({
  noteId,
  editor,
  loadedNote,
  chat,
  onPersistEditorState,
}: UseNoteAgentReviewOptions): UseNoteAgentReviewResult {
  // Live mirror of the target note. Async continuations compare against it
  // and discard results that raced a note switch instead of applying them to
  // the note the editor now shows.
  const noteIdRef = useRef(noteId);
  noteIdRef.current = noteId;

  // ---- note refresh when the agent edits the note ----
  const heldVersionRef = useRef<number | null>(null);
  const [noteReloadFailed, setNoteReloadFailed] = useState(false);
  // A choice-persisting save failed — the editor shows what the user picked,
  // but the server's newest version is still someone else's.
  const [persistFailed, setPersistFailed] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  // Owner token of the running choice-persisting save, mirroring
  // reloadLockRef: cleanup runs only while still owned, so a stale settle
  // (previous note) can't re-enable the banner buttons under a newer save.
  const persistLockRef = useRef<object | null>(null);
  const [isReloadingNote, setIsReloadingNote] = useState(false);
  /**
   * Owner token of the running reload/review fetch. Callers take the lock by
   * storing a fresh object and clean up only while they still own it, so a
   * stale settle (previous note, superseded request) can neither free a newer
   * request's lock nor stop its spinner.
   */
  const reloadLockRef = useRef<object | null>(null);

  // Newest agent-authored note version heard from any source — the note
  // version socket, the selected chat's activity, or the reconnect probe.
  // The ref is what comparisons read; the state is what re-runs the effect.
  const latestAgentVersionRef = useRef<number | null>(null);
  const [agentVersionSignal, setAgentVersionSignal] = useState<number | null>(null);

  // Newest version known to exist server-side, whoever wrote it. A pinned
  // reload compares against this to tell whether the version it applied is
  // still the server's newest — if not, the applied choice must be persisted
  // or it would vanish on the next load (see reloadNoteContent).
  const serverHeadRef = useRef<number | null>(null);

  const recordServerHead = useCallback((versionId: number) => {
    serverHeadRef.current = Math.max(serverHeadRef.current ?? 0, versionId);
  }, []);

  const recordAgentVersion = useCallback(
    (versionId: number) => {
      recordServerHead(versionId);
      const prev = latestAgentVersionRef.current;
      if (prev != null && versionId <= prev) return;
      latestAgentVersionRef.current = versionId;
      setAgentVersionSignal(versionId);
    },
    [recordServerHead]
  );

  // In-note review: the editor document becomes the merge of both versions —
  // the assistant's version with the overwritten content spliced back in as
  // struck, still-editable text. Everything stays editable; Accept/Reject
  // resolve positionally, so edits made during the review survive with the
  // section they touched.
  const [review, setReview] = useState<{
    versionId: number;
    changeCount: number;
  } | null>(null);
  // Identity of the live review. Change-count callbacks arrive on microtasks
  // and can outlive the review that scheduled them (an overlay folded into a
  // newer one, or just resolved) — a bump makes every earlier callback stale.
  const reviewEpochRef = useRef(0);
  // Re-runs the auto-review effect once a fetch lock frees, so a version that
  // arrived while another was being fetched still gets reviewed.
  const [reviewNudge, setReviewNudge] = useState(0);
  // A version whose review fetch failed — retried via the banner or a newer
  // version, never auto-looped by the nudge.
  const lastFailedReviewVersionRef = useRef<number | null>(null);

  // A new note's version stream starts clean — signals recorded for the
  // previous note must never compare against the new note's held version.
  useEffect(() => {
    latestAgentVersionRef.current = null;
    serverHeadRef.current = null;
    lastFailedReviewVersionRef.current = null;
    setAgentVersionSignal(null);
    // Release the previous note's reload and persist locks: its fetches must
    // not block this note's first refresh (a blocked signal never re-fires)
    // or keep its banner buttons disabled, and once disowned their settles
    // won't touch the spinners either.
    reloadLockRef.current = null;
    setIsReloadingNote(false);
    persistLockRef.current = null;
    setIsPersisting(false);
  }, [noteId]);

  // The overlay lives on the editor instance, and mid-review the document
  // holds merged content — fold it to the accept-projection (the same thing
  // saves have been persisting) when the note or editor goes away mid-review.
  useEffect(() => {
    setReview(null);
    return () => {
      reviewEpochRef.current++;
      resolveNoteDiffReview(editor, 'accept');
    };
  }, [editor, noteId]);

  useEffect(() => {
    heldVersionRef.current = loadedNote?.versionId ?? null;
    setNoteReloadFailed(false);
    setPersistFailed(false);
  }, [loadedNote?.id, loadedNote?.versionId]);

  /**
   * Escape hatch for when building the in-note review fails: fetch the
   * assistant's version and apply it verbatim, no overlay. Fetches the exact
   * promised version when it's known — fetching latest could return a newer
   * local autosave that buried it, silently handing the user their own
   * content back.
   */
  const reloadNoteContent = useCallback(async () => {
    if (noteId == null || reloadLockRef.current != null) return;
    const lock = {};
    reloadLockRef.current = lock;
    setIsReloadingNote(true);
    setNoteReloadFailed(false);
    setPersistFailed(false);
    try {
      const pinnedVersionId = latestAgentVersionRef.current;
      const {
        contentJson,
        contentSrc,
        versionId: nextVersionId,
      } = await fetchReloadContent(String(noteId), pinnedVersionId);
      // Navigated away mid-fetch: this content and version belong to the
      // previous note and must not touch the current note's tracking.
      if (noteIdRef.current !== noteId) return;
      // A verbatim apply replaces the whole document; any half-merged review
      // content goes with it, so the overlay must not outlive it.
      reviewEpochRef.current++;
      endNoteDiffReview(editor);
      setReview(null);
      if (nextVersionId != null) recordServerHead(nextVersionId);
      applyVersionContent(editor, contentJson, contentSrc);
      heldVersionRef.current = nextVersionId ?? heldVersionRef.current;
      lastFailedReviewVersionRef.current = null;
      // A pinned version older than the server head means newer saves buried
      // the assistant's version. The editor now shows the chosen content,
      // but applying it emitted no update — without a re-save the choice
      // would silently vanish on the next load, so persist it now.
      if (pinnedVersionId != null && (serverHeadRef.current ?? 0) > pinnedVersionId) {
        const persisted = (await onPersistEditorState?.()) ?? true;
        if (noteIdRef.current !== noteId) return;
        if (!persisted) setPersistFailed(true);
      }
    } catch {
      // Same stale-note guard as the success path: a failure from the
      // previous note must not flash an error banner over the current one.
      if (noteIdRef.current !== noteId) return;
      setNoteReloadFailed(true);
    } finally {
      // Owner-only cleanup — see reloadLockRef.
      if (reloadLockRef.current === lock) {
        reloadLockRef.current = null;
        setIsReloadingNote(false);
        // A newer agent version may have landed while this ran.
        setReviewNudge((nudge) => nudge + 1);
      }
    }
  }, [noteId, editor, recordServerHead, onPersistEditorState]);

  /**
   * A change-count report from the overlay: the user edited whole regions
   * away (or a late microtask from a resolved review, which the epoch check
   * drops). Zero left means the review resolved itself organically — the
   * edits that did it were ordinary editor updates, already on their way to
   * autosave.
   */
  const handleLiveChangeCount = useCallback(
    (epoch: number, count: number) => {
      if (reviewEpochRef.current !== epoch) return;
      if (count <= 0) {
        reviewEpochRef.current++;
        endNoteDiffReview(editor);
        setReview(null);
        return;
      }
      setReview((prev) => (prev == null ? prev : { ...prev, changeCount: count }));
    },
    [editor]
  );

  /**
   * Turn the newest agent version into an in-note review, immediately: the
   * document becomes the assistant's version with whatever it overwrote —
   * including unsaved local edits — spliced back in as struck, editable
   * text. No banner, no interposed click; Accept/Reject (or just editing)
   * resolve it. Runs whether the editor was clean or dirty, and folds an
   * already-open review into the newer version.
   */
  const startDiffReview = useCallback(async () => {
    const pinnedVersionId = latestAgentVersionRef.current;
    if (!editor || editor.isDestroyed || pinnedVersionId == null) return;
    if (reloadLockRef.current != null) return;
    const lock = {};
    reloadLockRef.current = lock;
    setIsReloadingNote(true);
    setNoteReloadFailed(false);
    setPersistFailed(false);
    try {
      const version = await NoteService.getNoteVersion(pinnedVersionId);
      // Same stale-note guard as reloadNoteContent.
      if (noteIdRef.current !== noteId) return;
      if (editor.isDestroyed) return;
      recordServerHead(pinnedVersionId);
      const { node: incoming, content } = parseVersionForEditor(editor, version.json, version.src);
      const epoch = ++reviewEpochRef.current;
      let changeCount = 0;
      if (incoming) {
        changeCount = beginNoteDiffReview(editor, incoming, {
          onChangeCountUpdate: (count) => handleLiveChangeCount(epoch, count),
        });
      } else {
        // Neither serialization yielded a schema node — verbatim apply,
        // letting setContent's own parser do what it can.
        applyEditorContent(editor, content);
      }
      heldVersionRef.current = pinnedVersionId;
      lastFailedReviewVersionRef.current = null;
      setReview(changeCount > 0 ? { versionId: pinnedVersionId, changeCount } : null);
      // Newer saves outrank the version just reviewed (an autosave buried
      // it). Saves strip the struck ranges, so this persists the
      // accept-projection — re-promoting the assistant's content to the
      // server's newest without touching the open review.
      if ((serverHeadRef.current ?? 0) > pinnedVersionId) {
        const persisted = (await onPersistEditorState?.()) ?? true;
        if (noteIdRef.current !== noteId) return;
        if (editor.isDestroyed) return;
        if (!persisted) setPersistFailed(true);
      }
    } catch (error) {
      // The banner only says "couldn't load" — the cause (fetch, parse,
      // schema) is visible nowhere but here.
      console.error('Applying the assistant version failed', error);
      if (noteIdRef.current !== noteId) return;
      lastFailedReviewVersionRef.current = pinnedVersionId;
      setNoteReloadFailed(true);
    } finally {
      // Owner-only cleanup — see reloadLockRef.
      if (reloadLockRef.current === lock) {
        reloadLockRef.current = null;
        setIsReloadingNote(false);
        // A newer agent version may have landed while this ran — nudge the
        // auto-review effect now that the lock is free.
        setReviewNudge((nudge) => nudge + 1);
      }
    }
  }, [editor, noteId, recordServerHead, onPersistEditorState, handleLiveChangeCount]);

  /**
   * Keep the assistant's side: delete the struck ranges, keep everything
   * else — including anything typed during the review. The result is exactly
   * what saves have been persisting all along, so no extra save is needed;
   * edits made mid-review reached autosave as ordinary updates.
   */
  const acceptReview = useCallback(() => {
    reviewEpochRef.current++;
    resolveNoteDiffReview(editor, 'accept');
    setReview(null);
  }, [editor]);

  /**
   * Keep the reader's side: delete the inserted ranges, keep everything else
   * — struck content becomes plain again, and text typed inside it stays.
   * The server's newest is the assistant's version, so persist immediately;
   * the resolution itself emits no update and would otherwise never save.
   */
  const rejectReview = useCallback(async () => {
    if (!review) return;
    const { versionId } = review;
    reviewEpochRef.current++;
    const resolved = resolveNoteDiffReview(editor, 'reject');
    setReview(null);
    if (!resolved) return;
    const persistLock = {};
    persistLockRef.current = persistLock;
    setIsPersisting(true);
    const noteAtCall = noteIdRef.current;
    try {
      const persisted = (await onPersistEditorState?.()) ?? true;
      if (noteIdRef.current !== noteAtCall) return;
      if (persisted) {
        const held = heldVersionRef.current;
        heldVersionRef.current = held == null ? versionId : Math.max(held, versionId);
        setPersistFailed(false);
      } else {
        // The editor shows the user's choice, but the server's newest is
        // still the assistant's version — say so instead of claiming done.
        setPersistFailed(true);
      }
    } finally {
      // Owner-only cleanup — see persistLockRef.
      if (persistLockRef.current === persistLock) {
        persistLockRef.current = null;
        setIsPersisting(false);
      }
    }
  }, [review, editor, onPersistEditorState]);

  // After a socket drop, events were missed — the head version says whether
  // the newest commit is agent-authored and newer than what the editor holds,
  // the one catch-up case this flow owns. An editor-authored head is our own
  // (or another tab's) save, where local-wins is the long-standing behavior.
  const probeNoteHead = useCallback(async () => {
    if (noteId == null) return;
    try {
      const note = await NoteService.getNote(String(noteId));
      if (noteIdRef.current !== noteId) return;
      if (note.versionId) recordServerHead(note.versionId);
      if (note.versionCreatedVia === 'agent' && note.versionId) {
        recordAgentVersion(note.versionId);
      }
    } catch {
      // Advisory probe — the chat activity fallback still covers the
      // selected chat, and any later event resyncs.
    }
  }, [noteId, recordServerHead, recordAgentVersion]);

  // The per-note version channel: the backend pushes ids whenever any writer
  // commits a version, so agent edits surface no matter which chat (or tab)
  // produced them. Editor-authored events are this editor's own autosave
  // echoes — or another tab's, unchanged semantics — and system writers have
  // their own refresh flows; both are ignored here.
  useNoteVersionSocket({
    noteId,
    enabled: noteId != null,
    onEvent: (event) => {
      if (event.type !== NOTE_VERSION_CREATED) return;
      if (String(event.note_id) !== String(noteId)) return;
      // Every event advances the known server head, whoever wrote it.
      recordServerHead(event.version_id);
      if (event.created_via !== 'agent') return;
      recordAgentVersion(event.version_id);
    },
    onReconnect: probeNoteHead,
  });

  // Belt and braces alongside the socket: the selected chat's activity also
  // carries note_version_id on succeeded edit_note calls (REST stays the
  // source of truth; the socket is droppable by contract).
  const chatAgentVersion = useMemo(() => maxAgentNoteVersion(chat), [chat]);
  useEffect(() => {
    if (chatAgentVersion != null) recordAgentVersion(chatAgentVersion);
  }, [chatAgentVersion, recordAgentVersion]);

  // A newer agent-authored version exists than what the editor holds: start
  // (or fold into) an in-note review immediately, clean or dirty — the diff
  // itself is the ask. The nudge re-runs this once a fetch lock frees; a
  // version that already failed to load waits for the banner's retry.
  useEffect(() => {
    if (agentVersionSignal == null) return;
    // The signal can outrun the note load during a note switch — held still
    // belongs to the previous note until the current one lands.
    if (loadedNote == null || noteId == null || String(loadedNote.id) !== String(noteId)) return;
    if (reloadLockRef.current != null) return;
    const latestAgent = latestAgentVersionRef.current;
    const held = heldVersionRef.current;
    if (latestAgent == null || held == null || latestAgent <= held) return;
    const lastFailed = lastFailedReviewVersionRef.current;
    if (lastFailed != null && latestAgent <= lastFailed) return;
    startDiffReview();
  }, [agentVersionSignal, reviewNudge, loadedNote, noteId, startDiffReview]);

  const persistCurrentDoc = useCallback(async () => {
    // A choice-persisting save failed and the banner offered a retry: the
    // editor already shows what the user picked, so persisting it as the
    // newest server version is all that's left. Acknowledge the assistant's
    // version only once that save succeeds.
    const persistLock = {};
    persistLockRef.current = persistLock;
    setIsPersisting(true);
    setNoteReloadFailed(false);
    setPersistFailed(false);
    const noteAtCall = noteIdRef.current;
    // Captured with the payload: an agent version that lands while the save
    // is in flight postdates what this save persists, and acknowledging it
    // would let the auto-review guard skip its review.
    const coveredAgentVersion = latestAgentVersionRef.current;
    try {
      const persisted = (await onPersistEditorState?.()) ?? true;
      if (noteIdRef.current !== noteAtCall) return;
      if (!persisted) {
        setPersistFailed(true);
        return;
      }
      const held = heldVersionRef.current;
      if (coveredAgentVersion != null) {
        heldVersionRef.current =
          held == null ? coveredAgentVersion : Math.max(held, coveredAgentVersion);
      }
    } finally {
      // Owner-only cleanup — see persistLockRef.
      if (persistLockRef.current === persistLock) {
        persistLockRef.current = null;
        setIsPersisting(false);
      }
    }
  }, [onPersistEditorState]);

  return {
    review,
    accept: acceptReview,
    reject: rejectReview,
    retryReview: startDiffReview,
    reloadWithoutReview: reloadNoteContent,
    persistCurrentDoc,
    reloadFailed: noteReloadFailed,
    persistFailed,
    isReloading: isReloadingNote,
    isPersisting,
  };
}
