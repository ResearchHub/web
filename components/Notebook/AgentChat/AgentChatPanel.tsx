'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Check, MessageSquarePlus, Pencil, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useNotebookChat, useNotebookChatList, type SendOutcome } from '@/hooks/useNotebookChat';
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
import { ChatTranscript } from './ChatTranscript';
import { installNoteDiffOverlay, uninstallNoteDiffOverlay } from './noteDiffOverlay';
import { computeNoteDiff } from './noteVersionDiff';

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

/**
 * A running in-note review session, handed to the host so the accept/restore
 * controls can live on the note page rather than in the chat panel.
 */
export interface NoteReviewHandle {
  readonly changeCount: number;
  /** The reviewed document is the note now — just takes the overlay down. */
  readonly accept: () => void;
  /** Puts the pre-review document back and persists it. */
  readonly restoreMine: () => void;
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
  const editorDirtyRef = useRef(false);
  const [needsNoteReload, setNeedsNoteReload] = useState(false);
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

  // In-note review: the assistant's version becomes the editor document with
  // a diff overlay painted over it. `baseDoc` is what the editor showed when
  // the review began, kept for "Restore my version".
  const [review, setReview] = useState<{
    versionId: number;
    baseDoc: object;
    changeCount: number;
  } | null>(null);
  // Live mirror for effects that must not re-run on review changes.
  const reviewActiveRef = useRef(false);
  reviewActiveRef.current = review != null;

  // A new note's version stream starts clean — signals recorded for the
  // previous note must never compare against the new note's held version.
  useEffect(() => {
    latestAgentVersionRef.current = null;
    serverHeadRef.current = null;
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

  // The overlay lives on the editor instance; drop it (and the review) when
  // the note or editor goes away mid-review.
  useEffect(() => {
    setReview(null);
    return () => {
      uninstallNoteDiffOverlay(editor);
    };
  }, [editor, noteId]);

  useEffect(() => {
    heldVersionRef.current = currentNote?.versionId ?? null;
    editorDirtyRef.current = false;
    setNeedsNoteReload(false);
    setNoteReloadFailed(false);
    setPersistFailed(false);
  }, [currentNote?.id, currentNote?.versionId]);

  useEffect(() => {
    if (!editor) return;
    const markDirty = () => {
      editorDirtyRef.current = true;
    };
    editor.on('update', markDirty);
    return () => {
      editor.off('update', markDirty);
    };
  }, [editor]);

  const reloadNoteContent = useCallback(
    async (source: 'auto' | 'manual' = 'manual') => {
      // Concurrent auto refreshes would race each other's setContent, and the
      // running one already ends by re-checking for a newer version. Manual
      // clicks are serialized by the button's disabled state instead.
      if (source === 'auto' && reloadLockRef.current != null) return;
      const lock = {};
      reloadLockRef.current = lock;
      setIsReloadingNote(true);
      setNoteReloadFailed(false);
      setPersistFailed(false);
      try {
        // The banner promises the assistant's version, so a manual reload
        // fetches that exact version when it's known — fetching latest could
        // return a newer local autosave that buried it, silently handing the
        // user their own content back.
        const pinnedVersionId = source === 'manual' ? latestAgentVersionRef.current : null;
        const { content, versionId: nextVersionId } = await fetchReloadContent(
          noteId,
          pinnedVersionId
        );
        // Navigated away mid-fetch: this content and version belong to the
        // previous note and must not touch the current note's tracking (a
        // cleared dirty flag here would let a later agent edit silently
        // overwrite unsaved local work).
        if (targetRef.current.noteId !== noteId) return;
        // An auto refresh only starts while the editor is clean, but the user
        // may have typed during the fetch — applying the response now would
        // silently discard those keystrokes, so ask via the banner instead.
        // Manual reloads are the user answering that banner: always apply.
        if (source === 'auto' && editorDirtyRef.current) {
          setNeedsNoteReload(true);
          return;
        }
        if (nextVersionId != null) recordServerHead(nextVersionId);
        applyEditorContent(editor, content);
        heldVersionRef.current = nextVersionId ?? heldVersionRef.current;
        editorDirtyRef.current = false;
        // A pinned version older than the server head means newer saves
        // buried the assistant's version while the banner waited. The editor
        // now shows the chosen content, but applying it emitted no update —
        // without a re-save the choice would silently vanish on the next
        // load, so have the host persist it now and surface a failure ("Keep
        // mine" re-persists the current document, so it doubles as retry).
        if (pinnedVersionId != null && (serverHeadRef.current ?? 0) > pinnedVersionId) {
          const persisted = (await onPersistEditorState?.()) ?? true;
          if (targetRef.current.noteId !== noteId) return;
          if (!persisted) setPersistFailed(true);
        }
        // An even newer agent version can land while this fetch runs — keep
        // the banner up for it instead of claiming the editor is in sync.
        const latestAgent = latestAgentVersionRef.current;
        const held = heldVersionRef.current;
        setNeedsNoteReload(latestAgent != null && held != null && latestAgent > held);
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
        }
      }
    },
    [noteId, editor, recordServerHead, onPersistEditorState]
  );

  /**
   * The banner's "Review changes": apply the assistant's version as the real
   * editor document (same pinned fetch as Reload), then paint what changed
   * against what the editor was showing — including unsaved edits — as an
   * overlay. From there the note is just a note: the user edits it, restores
   * struck text by clicking it, and autosave persists plain content.
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
      // The base snapshot is read after the fetch so keystrokes typed while
      // it ran are part of the review: they show up in the diff and "Reject"
      // brings them back. Captured before the await, they'd be lost the
      // moment the assistant's version is applied.
      const baseDoc = editor.getJSON();
      const baseNode = editor.schema.nodeFromJSON(baseDoc);
      recordServerHead(pinnedVersionId);
      applyEditorContent(editor, parseVersionContent(version.json, version.src));
      heldVersionRef.current = pinnedVersionId;
      editorDirtyRef.current = false;
      // Diff against the settled editor document (extensions may have
      // re-stamped node ids while applying), so positions match what the
      // overlay decorates. Installed before the persist below so keystrokes
      // during that request are ordinary edits on a reviewed document, not
      // content the diff would mistake for the assistant's.
      const { spans, changeCount } = computeNoteDiff(editor.schema, baseNode, editor.state.doc);
      installNoteDiffOverlay(editor, spans);
      // Same buried-pin rule as reloadNoteContent: newer saves outrank the
      // version just applied, so persist the choice or it vanishes on the
      // next load. A failure surfaces once the review closes ("Keep mine"
      // re-persists the current document, so it doubles as retry).
      if ((serverHeadRef.current ?? 0) > pinnedVersionId) {
        const persisted = (await onPersistEditorState?.()) ?? true;
        if (targetRef.current.noteId !== noteId) return;
        if (editor.isDestroyed) return;
        if (!persisted) setPersistFailed(true);
      }
      setReview({ versionId: pinnedVersionId, baseDoc, changeCount });
      const latestAgent = latestAgentVersionRef.current;
      setNeedsNoteReload(latestAgent != null && latestAgent > pinnedVersionId);
    } catch {
      if (targetRef.current.noteId !== noteId) return;
      setNoteReloadFailed(true);
    } finally {
      // Owner-only cleanup — see reloadLockRef.
      if (reloadLockRef.current === lock) {
        reloadLockRef.current = null;
        setIsReloadingNote(false);
      }
    }
  }, [editor, noteId, recordServerHead, onPersistEditorState]);

  /** The reviewed document is the note now — just take the overlay down. */
  const acceptReview = useCallback(() => {
    uninstallNoteDiffOverlay(editor);
    setReview(null);
  }, [editor]);

  /** Put the pre-review document back and persist it, keep-mine semantics. */
  const restoreMyVersion = useCallback(async () => {
    if (!review) return;
    const { versionId, baseDoc } = review;
    if (editor && !editor.isDestroyed) {
      applyEditorContent(editor, baseDoc);
    }
    uninstallNoteDiffOverlay(editor);
    // The review is visually over either way; what remains is making the
    // restored document durable. Unsaved until then — a mid-save agent event
    // must ask via the banner, not silently reload over the restored content.
    setReview(null);
    editorDirtyRef.current = true;
    const persistLock = {};
    persistLockRef.current = persistLock;
    setIsPersisting(true);
    const noteAtCall = targetRef.current.noteId;
    try {
      // Applying content emits no update, so without this save the restored
      // document would vanish on the next load (the assistant's version is
      // the server's newest). Acknowledge the choice only once it's durable.
      const persisted = (await onPersistEditorState?.()) ?? true;
      if (targetRef.current.noteId !== noteAtCall) return;
      if (persisted) {
        editorDirtyRef.current = false;
        const held = heldVersionRef.current;
        heldVersionRef.current = held == null ? versionId : Math.max(held, versionId);
        setPersistFailed(false);
      } else {
        // The editor shows the user's choice, but the server's newest is
        // still the assistant's version — say so instead of claiming done.
        setNeedsNoteReload(true);
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

  // The accept/restore controls render on the note page, next to the content
  // they decide about — hand the host the current session, and null when it
  // ends or this panel unmounts.
  useEffect(() => {
    if (!onReviewChange) return;
    onReviewChange(
      review == null
        ? null
        : { changeCount: review.changeCount, accept: acceptReview, restoreMine: restoreMyVersion }
    );
    return () => onReviewChange(null);
  }, [review, onReviewChange, acceptReview, restoreMyVersion]);

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

  // A newer agent-authored version exists than what the editor holds: refresh
  // silently while the editor is clean, or ask via the banner when local
  // unsaved edits would be clobbered.
  useEffect(() => {
    if (agentVersionSignal == null) return;
    // The signal can outrun the note load during a note switch — held still
    // belongs to the previous note until the current one lands.
    if (currentNote == null || String(currentNote.id) !== String(noteId)) return;
    const held = heldVersionRef.current;
    if (held == null || agentVersionSignal <= held) return;
    if (editorDirtyRef.current || reviewActiveRef.current) {
      // A silent reload would clobber local unsaved edits — or yank the
      // document out from under an open review — so ask instead.
      setNeedsNoteReload(true);
    } else {
      reloadNoteContent('auto');
    }
  }, [agentVersionSignal, currentNote, noteId, reloadNoteContent]);

  const keepLocalVersion = async () => {
    // Explicit user-wins: have the host persist the local document — the
    // assistant's version may be the server's newest, so without a re-save
    // the choice would vanish on the next load — and acknowledge the
    // assistant's version only once that save succeeds. The assistant's
    // version remains in the note's history.
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
      setNeedsNoteReload(false);
    } finally {
      // Owner-only cleanup — see persistLockRef.
      if (persistLockRef.current === persistLock) {
        persistLockRef.current = null;
        setIsPersisting(false);
      }
    }
  };

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
    if (el && nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatState.chat, chatState.pendingSend]);

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
      className={cn(
        'fixed bottom-0 right-0 top-[var(--top-bar-height)] z-40 flex w-full flex-col border-l border-gray-200 bg-white shadow-xl transition-transform duration-200 sm:w-[400px]',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      )}
    >
      <header className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary-500" aria-hidden="true" />
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
              className="min-w-0 flex-1 rounded-md border border-primary-300 px-1.5 py-0.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitRename}
              title="Save title"
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Rename chat</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => switchChat(null)}
            title="New chat"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">New chat</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close assistant"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close assistant</span>
          </button>
        </div>
      </header>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3">
        {renderBody()}
      </div>

      {(needsNoteReload || noteReloadFailed || persistFailed) && review == null && (
        <div className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            {persistFailed
              ? 'Couldn’t save the note. Use “Keep mine” to try again.'
              : noteReloadFailed
                ? 'Couldn’t refresh the note. Try again.'
                : 'The assistant updated this note. Review its changes, reload, or keep yours.'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {needsNoteReload && (
              <Button
                variant="outlined"
                size="sm"
                onClick={startDiffReview}
                disabled={isReloadingNote || isPersisting}
              >
                {isReloadingNote ? <Loader size="sm" /> : 'Review changes'}
              </Button>
            )}
            <Button
              variant={needsNoteReload ? 'ghost' : 'outlined'}
              size="sm"
              onClick={() => reloadNoteContent()}
              disabled={isReloadingNote || isPersisting}
            >
              {isReloadingNote && !needsNoteReload ? <Loader size="sm" /> : 'Reload'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={keepLocalVersion}
              disabled={isReloadingNote || isPersisting}
            >
              {isPersisting ? <Loader size="sm" /> : 'Keep mine'}
            </Button>
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
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
        <Sparkles className="h-5 w-5 text-primary-500" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">Research assistant</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Ask questions about this note, search the web and scholarly literature, or have the
          assistant edit the draft for you.
        </p>
      </div>
    </div>
  );
}
