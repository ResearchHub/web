'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { Check, MessageSquarePlus, Pencil, X } from 'lucide-react';
import { DOMParser as ProseMirrorDOMParser, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useNotebookChat, useNotebookChatList, type SendOutcome } from '@/hooks/useNotebookChat';
import { MAX_AGENT_CHAT_WIDTH, MIN_AGENT_CHAT_WIDTH } from '@/hooks/useAgentChatWidth';
import { useNoteVersionSocket } from '@/hooks/useNoteVersionSocket';
import { NoteService } from '@/services/note.service';
import { NOTE_VERSION_CREATED } from '@/types/note';
import {
  isActiveExecutionStatus,
  MAX_CHAT_TITLE_LENGTH,
  type NotebookChat,
} from '@/types/notebookChat';
import { ChatComposer, type ComposerNotice } from './ChatComposer';
import { ChatPicker } from './ChatPicker';
import { ChatSources, collectChatSources } from './ChatSources';
import { ChatTranscript } from './ChatTranscript';
import { Logo } from '@/components/ui/Logo';
import {
  beginNoteDiffReview,
  endNoteDiffReview,
  resolveNoteDiffReview,
} from '../NoteReview/noteDiffOverlay';

type PanelTab = 'chat' | 'sources';

/** Pixels per arrow key press while the resize divider has focus. */
const RESIZE_KEY_STEP = 24;

function noticeFromOutcome(outcome: SendOutcome & { ok: false }): ComposerNotice {
  switch (outcome.reason) {
    case 'busy':
      return {
        tone: 'warning',
        text: outcome.detail ?? 'The assistant is still working on a previous message.',
      };
    case 'invalid':
      return { tone: 'error', text: outcome.detail ?? 'That message can’t be sent.' };
    case 'not_found':
      return { tone: 'error', text: 'This chat is no longer available.' };
    case 'unauthorized':
      return { tone: 'error', text: 'You no longer have access to the assistant.' };
    default:
      return { tone: 'error', text: 'Something went wrong — your message wasn’t sent.' };
  }
}

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
 * Fetch the content a reload should apply: the pinned version when the banner
 * promised a specific assistant version, otherwise the note's latest.
 */
async function fetchReloadContent(
  noteId: string,
  pinnedVersionId: number | null
): Promise<{ content: string | object; versionId: number | null }> {
  if (pinnedVersionId != null) {
    const version = await NoteService.getNoteVersion(pinnedVersionId);
    return { content: parseVersionContent(version.json, version.src), versionId: pinnedVersionId };
  }
  const note = await NoteService.getNote(noteId);
  return {
    content: parseVersionContent(note.contentJson, note.content),
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
 * A running in-note review session, handed to the host so the accept/reject
 * controls can live on the note page rather than in the chat panel.
 */
export interface NoteReviewHandle {
  readonly changeCount: number;
  /** Keep the assistant's side: deletes the struck ranges, keeps the rest. */
  readonly accept: () => void;
  /** Keep the reader's side: deletes the inserted ranges and persists it. */
  readonly reject: () => void;
}

interface AgentChatPanelProps {
  readonly noteId: string;
  readonly open: boolean;
  readonly onClose: () => void;
  /** The server denied access (gate changed / signed out) — hide the entry point. */
  readonly onUnavailable: () => void;
  /**
   * The editor's current document must be persisted as a new server version:
   * the user chose "Keep mine" over an assistant version, or a reload applied
   * an assistant version that newer saves had buried. Applying content
   * programmatically emits no editor update, so without this save the choice
   * would only live in this editor instance and vanish on the next load.
   * Persists immediately and resolves with whether the save reached the
   * server — the panel acknowledges the choice only on success.
   */
  readonly onPersistEditorState?: () => Promise<boolean>;
  /**
   * Docked (desktop) mode: the panel takes `width` and the host reserves the
   * same gutter, so it sits beside the document instead of over it. Undocked,
   * it covers the viewport as a sheet.
   */
  readonly docked: boolean;
  readonly width: number;
  readonly isResizing: boolean;
  readonly onResizeStart: () => void;
  /** Keyboard resize from the divider; negative widens the panel. */
  readonly onResizeNudge: (deltaX: number) => void;
  /**
   * An in-note review started or ended. The host renders the accept/restore
   * controls over the note; null means no review is active.
   */
  readonly onReviewChange?: (review: NoteReviewHandle | null) => void;
}

/**
 * The notebook AI assistant panel: chat picker, transcript with live turn
 * progress, and composer. Stays mounted while the notebook is open so chat
 * selection and drafts survive closing the panel; all network activity is
 * gated on `open`.
 */
export function AgentChatPanel({
  noteId,
  open,
  onClose,
  onUnavailable,
  onPersistEditorState,
  docked,
  width,
  isResizing,
  onResizeStart,
  onResizeNudge,
  onReviewChange,
}: AgentChatPanelProps) {
  const { editor, currentNote } = useNotebookContext();

  const list = useNotebookChatList(noteId, open);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [initialChat, setInitialChat] = useState<NotebookChat | null>(null);
  const autoSelectedRef = useRef(false);

  // Network activity is gated on `open`. No keep-alive is needed for turns
  // that finish while the panel is closed or another chat is selected: the
  // note version socket below reports agent edits from any chat, and
  // reopening (or reselecting) refetches the transcript.
  const chatState = useNotebookChat({
    noteId,
    chatId: selectedChatId,
    enabled: open,
    initialChat,
  });

  const switchChat = useCallback((nextChatId: number | null) => {
    setSelectedChatId(nextChatId);
    setInitialChat(null);
  }, []);

  // ---- drafts (per chat, surviving switches and failed sends) ----
  const draftsRef = useRef(new Map<string, string>());
  const draftKey = selectedChatId == null ? 'new' : String(selectedChatId);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<ComposerNotice | null>(null);
  /** First message for a chat we just created, sent once the chat is live. */
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  /** Identity of the latest creation, so a stale settle can't clear its flag. */
  const creationSeqRef = useRef(0);

  /** Draft writes go through here so the per-chat map stays in sync. */
  const updateDraft = useCallback(
    (value: string) => {
      draftsRef.current.set(draftKey, value);
      setDraft(value);
    },
    [draftKey]
  );

  const prevDraftKeyRef = useRef(draftKey);
  useEffect(() => {
    if (prevDraftKeyRef.current === draftKey) return;
    prevDraftKeyRef.current = draftKey;
    setDraft(draftsRef.current.get(draftKey) ?? '');
    setNotice(null);
  }, [draftKey]);

  // ---- reset everything when the note changes ----
  useEffect(() => {
    setSelectedChatId(null);
    setInitialChat(null);
    setNotice(null);
    setQueuedMessage(null);
    setCreatingChat(false);
    autoSelectedRef.current = false;
    draftsRef.current.clear();
    setDraft('');
  }, [noteId]);

  // ---- server-side access gate ----
  useEffect(() => {
    if (list.access === 'hidden' || chatState.access === 'unauthorized') {
      onUnavailable();
    }
  }, [list.access, chatState.access, onUnavailable]);

  // ---- auto-select the most recent chat once per panel open ----
  useEffect(() => {
    if (!open) {
      autoSelectedRef.current = false;
      return;
    }
    if (autoSelectedRef.current || list.access !== 'ok') return;
    autoSelectedRef.current = true;
    if (selectedChatId == null && list.chats.length > 0) {
      setSelectedChatId(list.chats[0].id);
      setInitialChat(null);
    }
  }, [open, list.access, list.chats, selectedChatId]);

  // ---- keep the listing fresh as the open chat evolves ----
  // Derived titles land after the first turn, previews/spinners change as
  // turns settle. Refresh only on actual transitions to avoid extra chatter.
  const latestStatus = chatState.latestExecution?.status ?? null;
  const chatTitle = chatState.chat?.title ?? null;
  const refreshList = list.refresh;
  const prevListSignalRef = useRef<{ status: string | null; title: string | null }>({
    status: null,
    title: null,
  });
  useEffect(() => {
    const prev = prevListSignalRef.current;
    const changed = prev.status !== latestStatus || prev.title !== chatTitle;
    prevListSignalRef.current = { status: latestStatus, title: chatTitle };
    if (open && changed) refreshList();
  }, [open, latestStatus, chatTitle, refreshList]);

  // ---- sending ----
  // Live mirror of the panel's target. Async continuations compare against it
  // and discard results that raced a chat or note switch instead of applying
  // them to the newly selected chat — the hook guards its own state the same
  // way, but the returned outcomes surface here.
  const targetRef = useRef<{ noteId: string; chatId: number | null }>({
    noteId,
    chatId: selectedChatId,
  });
  targetRef.current = { noteId, chatId: selectedChatId };
  const isCurrentTarget = useCallback(
    (target: { noteId: string; chatId: number | null }) =>
      targetRef.current.noteId === target.noteId && targetRef.current.chatId === target.chatId,
    []
  );

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setNotice(null);
    const target = targetRef.current;

    if (selectedChatId == null) {
      // Default flow: create untitled, send the first message; the refetch
      // after the turn brings the derived title.
      const creationSeq = ++creationSeqRef.current;
      setCreatingChat(true);
      const created = await list.createChat();
      // A newer creation may own the flag by now (the user moved to another
      // note and started a chat there) — a stale settle must not unblock its
      // composer while that creation is still in flight.
      if (creationSeqRef.current === creationSeq) setCreatingChat(false);
      // Switched note or picked an existing chat meanwhile — abandon the
      // creation instead of yanking the selection to a stale chat.
      if (!isCurrentTarget(target)) return;
      if (!created) {
        setNotice({ tone: 'error', text: 'Couldn’t start a chat. Please try again.' });
        return;
      }
      draftsRef.current.delete('new');
      setInitialChat(created);
      setSelectedChatId(created.conversation_id);
      setQueuedMessage(text);
      return;
    }

    const outcome = await chatState.send(text);
    if (outcome.ok) {
      if (isCurrentTarget(target)) {
        updateDraft('');
      } else {
        // Sent fine, but the user moved on — just retire the sent draft.
        draftsRef.current.delete(String(target.chatId));
      }
    } else if (isCurrentTarget(target)) {
      // Keep the draft on any failure.
      setNotice(noticeFromOutcome(outcome));
    }
  }, [draft, selectedChatId, list, chatState, updateDraft, isCurrentTarget]);

  // Fire the queued first message once the freshly created chat is live.
  const sendToChat = chatState.send;
  useEffect(() => {
    if (queuedMessage == null || selectedChatId == null || chatState.access !== 'ok') return;
    const text = queuedMessage;
    const target = targetRef.current;
    setQueuedMessage(null);
    sendToChat(text).then((outcome) => {
      if (outcome.ok) return;
      if (isCurrentTarget(target)) {
        setNotice(noticeFromOutcome(outcome));
        updateDraft(text);
      } else {
        // Failed after a switch — keep the unsent text under its own chat.
        draftsRef.current.set(String(target.chatId), text);
      }
    });
  }, [queuedMessage, selectedChatId, chatState.access, sendToChat, updateDraft, isCurrentTarget]);

  // ---- rename ----
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const startRename = () => {
    if (selectedChatId == null) return;
    setRenameValue(chatState.chat?.title ?? '');
    setRenaming(true);
  };

  const commitRename = async () => {
    setRenaming(false);
    const title = renameValue.trim();
    if (!title || title === (chatState.chat?.title ?? '')) return;
    const target = targetRef.current;
    const renamed = await chatState.rename(title);
    // A rename that raced a switch must not fire its note-bound refresh — the
    // stale fetch would outrank and replace the current note's listing.
    if (renamed && isCurrentTarget(target)) refreshList();
  };

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
    heldVersionRef.current = currentNote?.versionId ?? null;
    setNoteReloadFailed(false);
    setPersistFailed(false);
  }, [currentNote?.id, currentNote?.versionId]);

  /**
   * Escape hatch for when building the in-note review fails: fetch the
   * assistant's version and apply it verbatim, no overlay. Fetches the exact
   * promised version when it's known — fetching latest could return a newer
   * local autosave that buried it, silently handing the user their own
   * content back.
   */
  const reloadNoteContent = useCallback(async () => {
    if (reloadLockRef.current != null) return;
    const lock = {};
    reloadLockRef.current = lock;
    setIsReloadingNote(true);
    setNoteReloadFailed(false);
    setPersistFailed(false);
    try {
      const pinnedVersionId = latestAgentVersionRef.current;
      const { content, versionId: nextVersionId } = await fetchReloadContent(
        noteId,
        pinnedVersionId
      );
      // Navigated away mid-fetch: this content and version belong to the
      // previous note and must not touch the current note's tracking.
      if (targetRef.current.noteId !== noteId) return;
      // A verbatim apply replaces the whole document; any half-merged review
      // content goes with it, so the overlay must not outlive it.
      reviewEpochRef.current++;
      endNoteDiffReview(editor);
      setReview(null);
      if (nextVersionId != null) recordServerHead(nextVersionId);
      applyEditorContent(editor, content);
      heldVersionRef.current = nextVersionId ?? heldVersionRef.current;
      lastFailedReviewVersionRef.current = null;
      // A pinned version older than the server head means newer saves buried
      // the assistant's version. The editor now shows the chosen content,
      // but applying it emitted no update — without a re-save the choice
      // would silently vanish on the next load, so persist it now.
      if (pinnedVersionId != null && (serverHeadRef.current ?? 0) > pinnedVersionId) {
        const persisted = (await onPersistEditorState?.()) ?? true;
        if (targetRef.current.noteId !== noteId) return;
        if (!persisted) setPersistFailed(true);
      }
    } catch {
      // Same stale-note guard as the success path: a failure from the
      // previous note must not flash an error banner over the current one.
      if (targetRef.current.noteId !== noteId) return;
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
      if (targetRef.current.noteId !== noteId) return;
      if (editor.isDestroyed) return;
      recordServerHead(pinnedVersionId);
      const content = parseVersionContent(version.json, version.src);
      const incoming = parseIncomingNode(editor, content);
      const epoch = ++reviewEpochRef.current;
      let changeCount = 0;
      if (incoming) {
        changeCount = beginNoteDiffReview(editor, incoming, {
          onChangeCountUpdate: (count) => handleLiveChangeCount(epoch, count),
        });
      } else {
        // Unparseable version content — fall back to a verbatim apply.
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
        if (targetRef.current.noteId !== noteId) return;
        if (editor.isDestroyed) return;
        if (!persisted) setPersistFailed(true);
      }
    } catch {
      if (targetRef.current.noteId !== noteId) return;
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
    const noteAtCall = targetRef.current.noteId;
    try {
      const persisted = (await onPersistEditorState?.()) ?? true;
      if (targetRef.current.noteId !== noteAtCall) return;
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

  // The accept/reject controls render on the note page, next to the content
  // they decide about — hand the host the current session, and null when it
  // ends or this panel unmounts.
  useEffect(() => {
    if (!onReviewChange) return;
    onReviewChange(
      review == null
        ? null
        : { changeCount: review.changeCount, accept: acceptReview, reject: rejectReview }
    );
    return () => onReviewChange(null);
  }, [review, onReviewChange, acceptReview, rejectReview]);

  // After a socket drop, events were missed — the head version says whether
  // the newest commit is agent-authored and newer than what the editor holds,
  // the one catch-up case this flow owns. An editor-authored head is our own
  // (or another tab's) save, where local-wins is the long-standing behavior.
  const probeNoteHead = useCallback(async () => {
    try {
      const note = await NoteService.getNote(noteId);
      if (targetRef.current.noteId !== noteId) return;
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
    enabled: true,
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
  const chatAgentVersion = useMemo(() => maxAgentNoteVersion(chatState.chat), [chatState.chat]);
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
    if (currentNote == null || String(currentNote.id) !== String(noteId)) return;
    if (reloadLockRef.current != null) return;
    const latestAgent = latestAgentVersionRef.current;
    const held = heldVersionRef.current;
    if (latestAgent == null || held == null || latestAgent <= held) return;
    const lastFailed = lastFailedReviewVersionRef.current;
    if (lastFailed != null && latestAgent <= lastFailed) return;
    startDiffReview();
  }, [agentVersionSignal, reviewNudge, currentNote, noteId, startDiffReview]);

  const persistCurrentDoc = async () => {
    // A choice-persisting save failed and the banner offered a retry: the
    // editor already shows what the user picked, so persisting it as the
    // newest server version is all that's left. Acknowledge the assistant's
    // version only once that save succeeds.
    const persistLock = {};
    persistLockRef.current = persistLock;
    setIsPersisting(true);
    setNoteReloadFailed(false);
    setPersistFailed(false);
    const noteAtCall = targetRef.current.noteId;
    try {
      const persisted = (await onPersistEditorState?.()) ?? true;
      if (targetRef.current.noteId !== noteAtCall) return;
      if (!persisted) {
        setPersistFailed(true);
        return;
      }
      const held = heldVersionRef.current;
      const latestAgent = latestAgentVersionRef.current;
      if (latestAgent != null) {
        heldVersionRef.current = held == null ? latestAgent : Math.max(held, latestAgent);
      }
    } finally {
      // Owner-only cleanup — see persistLockRef.
      if (persistLockRef.current === persistLock) {
        persistLockRef.current = null;
        setIsPersisting(false);
      }
    }
  };

  // ---- chat / sources tabs ----
  const sources = useMemo(() => collectChatSources(chatState.chat), [chatState.chat]);
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  // A new chat starts with no citations, so a lingering Sources tab would open
  // on an empty list.
  useEffect(() => {
    setActiveTab('chat');
  }, [selectedChatId, noteId]);

  // ---- transcript auto-scroll ----
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    nearBottomRef.current = true;
  }, [selectedChatId]);

  useEffect(() => {
    const el = scrollRef.current;
    // The sources list shares this scroller; pinning it to the bottom on every
    // transcript update would yank the citation the user is reading.
    if (el && nearBottomRef.current && activeTab === 'chat') {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatState.chat, chatState.pendingSend, activeTab]);

  // ---- derived composer state ----
  const composerBusy =
    chatState.isBusy || chatState.isFinishing || creatingChat || queuedMessage != null;
  // Stop is only offered once something cancellable exists server-side. While
  // the message POST is still in flight or the chat is being created, cancel
  // would no-op and the turn would start anyway.
  const turnActive =
    chatState.latestExecution != null && isActiveExecutionStatus(chatState.latestExecution.status);
  const canStop = turnActive || chatState.pendingSend?.executionId != null;
  const composerDisabled =
    selectedChatId == null ? list.access !== 'ok' : chatState.access !== 'ok';

  const renderBody = () => {
    if (selectedChatId == null) {
      if (list.access === 'loading') return <CenteredLoader />;
      if (list.access === 'error') {
        return <ErrorState message="Couldn’t load your chats." onRetry={() => refreshList()} />;
      }
      return <EmptyState />;
    }

    switch (chatState.access) {
      case 'loading':
        return <CenteredLoader />;
      case 'not_found':
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-gray-600">This chat is no longer available.</p>
            <Button variant="outlined" size="sm" onClick={() => switchChat(null)}>
              Start a new chat
            </Button>
          </div>
        );
      case 'error':
        return (
          <ErrorState message="Couldn’t load this chat." onRetry={() => chatState.refetch()} />
        );
      default: {
        if (!chatState.chat) return <CenteredLoader />;
        const isEmpty =
          chatState.chat.messages.length === 0 &&
          chatState.chat.executions.length === 0 &&
          !chatState.pendingSend;
        if (isEmpty) return <EmptyState />;
        return <ChatTranscript chat={chatState.chat} pendingSend={chatState.pendingSend} />;
      }
    }
  };

  return (
    <aside
      aria-label="Research assistant"
      aria-hidden={!open}
      // Off-screen means out of the tab order too — pointer-events alone
      // still leaves the hidden controls keyboard-focusable.
      inert={!open}
      style={{ width: docked ? width : undefined }}
      className={cn(
        // Above the mobile bottom nav (z-[100]), which would otherwise cover
        // the composer while the sheet is open.
        'fixed bottom-0 right-0 top-[var(--top-bar-height)] z-[110] flex flex-col border-l border-gray-200 bg-white',
        'shadow-[-8px_0_28px_-16px_rgba(31,30,27,0.22)]',
        !docked && 'w-full',
        // A transition during a drag lags the pointer.
        !isResizing && 'transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      )}
    >
      {docked && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant panel"
          aria-valuenow={width}
          aria-valuemin={MIN_AGENT_CHAT_WIDTH}
          aria-valuemax={MAX_AGENT_CHAT_WIDTH}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            onResizeStart();
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            onResizeNudge(event.key === 'ArrowLeft' ? -RESIZE_KEY_STEP : RESIZE_KEY_STEP);
          }}
          className="group absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize focus:outline-none"
        >
          <div
            className={cn(
              'mx-auto h-full w-0.5 transition-colors group-hover:bg-primary-300 group-focus:bg-primary-400',
              isResizing ? 'bg-primary-400' : 'bg-transparent'
            )}
          />
        </div>
      )}

      <header className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2">
        {renaming ? (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={renameValue}
              maxLength={MAX_CHAT_TITLE_LENGTH}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitRename();
                if (event.key === 'Escape') setRenaming(false);
              }}
              onBlur={commitRename}
              aria-label="Chat title"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-1.5 py-0.5 text-sm font-medium text-gray-800 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitRename}
              title="Save title"
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Save title</span>
            </button>
          </div>
        ) : (
          <ChatPicker
            chats={list.chats}
            activeChatId={selectedChatId}
            activeTitle={chatTitle}
            onSelect={switchChat}
            onNewChat={() => switchChat(null)}
            onOpen={() => refreshList()}
          />
        )}
        <div className="flex shrink-0 items-center">
          {selectedChatId != null && !renaming && (
            <button
              type="button"
              onClick={startRename}
              title="Rename chat"
              className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Rename chat</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => switchChat(null)}
            title="New chat"
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">New chat</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close assistant"
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close assistant</span>
          </button>
        </div>
      </header>

      {sources.length > 0 && (
        <div
          role="tablist"
          aria-label="Assistant views"
          className="flex items-center gap-1 border-b border-gray-100 px-3 py-1.5"
        >
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            label="Chat"
          />
          <TabButton
            active={activeTab === 'sources'}
            onClick={() => setActiveTab('sources')}
            label="Sources"
            count={sources.length}
          />
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === 'sources' ? <ChatSources sources={sources} /> : renderBody()}
      </div>

      {(noteReloadFailed || persistFailed) && review == null && (
        <div className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            {persistFailed ? 'Couldn’t save the note.' : 'Couldn’t load the assistant’s update.'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {persistFailed ? (
              <Button
                variant="outlined"
                size="sm"
                onClick={persistCurrentDoc}
                disabled={isReloadingNote || isPersisting}
              >
                {isPersisting ? <Loader size="sm" /> : 'Try again'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={startDiffReview}
                  disabled={isReloadingNote || isPersisting}
                >
                  {isReloadingNote ? <Loader size="sm" /> : 'Try again'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reloadNoteContent}
                  disabled={isReloadingNote || isPersisting}
                >
                  Reload without review
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <ChatComposer
        value={draft}
        onChange={updateDraft}
        onSend={handleSend}
        onStop={chatState.cancel}
        busy={composerBusy}
        canStop={canStop}
        disabled={composerDisabled}
        notice={notice}
      />
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly label: string;
  readonly count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
        active ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      )}
    >
      {label}
      {count != null && (
        <span
          className={cn(
            'rounded-full px-1.5 text-[10px] font-semibold',
            active ? 'bg-white text-gray-600' : 'bg-gray-100 text-gray-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CenteredLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader size="md" className="text-primary-500" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      <Button variant="outlined" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50">
        <Logo size={32} noText />
      </div>
      <div>
        <p className="flex items-center justify-center gap-1.5 font-serif text-lg tracking-tight text-gray-800">
          Research assistant
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          Ask questions about this note, search the web and scholarly literature, or have the
          assistant edit the draft for you.
        </p>
      </div>
    </div>
  );
}
