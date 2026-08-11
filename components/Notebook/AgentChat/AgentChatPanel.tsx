'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, MessageSquarePlus, Pencil, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useNotebookChat, useNotebookChatList, type SendOutcome } from '@/hooks/useNotebookChat';
import { NoteService } from '@/services/note.service';
import { MAX_CHAT_TITLE_LENGTH, type NotebookChat } from '@/types/notebookChat';
import { ChatComposer, type ComposerNotice } from './ChatComposer';
import { ChatPicker } from './ChatPicker';
import { ChatTranscript } from './ChatTranscript';

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
    default:
      return { tone: 'error', text: 'Something went wrong — your message wasn’t sent.' };
  }
}

interface AgentChatPanelProps {
  readonly noteId: string;
  readonly open: boolean;
  readonly onClose: () => void;
  /** The server denied access (gate changed / signed out) — hide the entry point. */
  readonly onUnavailable: () => void;
}

/**
 * The notebook AI assistant panel: chat picker, transcript with live turn
 * progress, and composer. Stays mounted while the notebook is open so chat
 * selection and drafts survive closing the panel; all network activity is
 * gated on `open`.
 */
export function AgentChatPanel({ noteId, open, onClose, onUnavailable }: AgentChatPanelProps) {
  const { editor, currentNote } = useNotebookContext();

  const list = useNotebookChatList(noteId, open);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [initialChat, setInitialChat] = useState<NotebookChat | null>(null);
  const autoSelectedRef = useRef(false);

  const chatState = useNotebookChat({
    noteId,
    chatId: selectedChatId,
    enabled: open,
    initialChat,
  });

  // ---- drafts (per chat, surviving switches and failed sends) ----
  const draftsRef = useRef(new Map<string, string>());
  const draftKey = selectedChatId == null ? 'new' : String(selectedChatId);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<ComposerNotice | null>(null);
  /** First message for a chat we just created, sent once the chat is live. */
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

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
  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setNotice(null);

    if (selectedChatId == null) {
      // Default flow: create untitled, send the first message; the refetch
      // after the turn brings the derived title.
      setCreatingChat(true);
      const created = await list.createChat();
      setCreatingChat(false);
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
      updateDraft('');
    } else {
      // Keep the draft on any failure.
      setNotice(noticeFromOutcome(outcome));
    }
  }, [draft, selectedChatId, list, chatState, updateDraft]);

  // Fire the queued first message once the freshly created chat is live.
  const sendToChat = chatState.send;
  useEffect(() => {
    if (queuedMessage == null || selectedChatId == null || chatState.access !== 'ok') return;
    const text = queuedMessage;
    setQueuedMessage(null);
    sendToChat(text).then((outcome) => {
      if (!outcome.ok) {
        setNotice(noticeFromOutcome(outcome));
        updateDraft(text);
      }
    });
  }, [queuedMessage, selectedChatId, chatState.access, sendToChat, updateDraft]);

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
    const renamed = await chatState.rename(title);
    if (renamed) refreshList();
  };

  // ---- note refresh when the agent edits the note ----
  const heldVersionRef = useRef<number | null>(null);
  const editorDirtyRef = useRef(false);
  const [needsNoteReload, setNeedsNoteReload] = useState(false);
  const [noteReloadFailed, setNoteReloadFailed] = useState(false);
  const [isReloadingNote, setIsReloadingNote] = useState(false);

  useEffect(() => {
    heldVersionRef.current = currentNote?.versionId ?? null;
    editorDirtyRef.current = false;
    setNeedsNoteReload(false);
    setNoteReloadFailed(false);
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

  // Highest note version produced by a succeeded edit_note across this chat.
  const agentNoteVersionId = useMemo(() => {
    let max: number | null = null;
    for (const execution of chatState.chat?.executions ?? []) {
      for (const item of execution.activity ?? []) {
        if (item.type === 'tool_call' && item.note_version_id != null) {
          max = max == null ? item.note_version_id : Math.max(max, item.note_version_id);
        }
      }
    }
    return max;
  }, [chatState.chat]);

  const reloadNoteContent = useCallback(async () => {
    setIsReloadingNote(true);
    setNoteReloadFailed(false);
    try {
      const note = await NoteService.getNote(noteId);
      if (editor && !editor.isDestroyed) {
        let content: string | object = note.content ?? '';
        if (note.contentJson) {
          try {
            content = JSON.parse(note.contentJson);
          } catch {
            // Malformed JSON — fall back to the HTML source.
          }
        }
        // emitUpdate=false: applying the agent's version isn't a user edit and
        // must not trigger the notebook autosave.
        editor.commands.setContent(content, { emitUpdate: false });
      }
      heldVersionRef.current = note.versionId ?? heldVersionRef.current;
      editorDirtyRef.current = false;
      setNeedsNoteReload(false);
    } catch {
      setNoteReloadFailed(true);
    } finally {
      setIsReloadingNote(false);
    }
  }, [noteId, editor]);

  useEffect(() => {
    const held = heldVersionRef.current;
    if (agentNoteVersionId == null || held == null) return;
    if (agentNoteVersionId <= held) return;
    if (editorDirtyRef.current) {
      // A silent reload would clobber local unsaved edits — ask instead.
      setNeedsNoteReload(true);
    } else {
      reloadNoteContent();
    }
  }, [agentNoteVersionId, reloadNoteContent]);

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
            <Button
              variant="outlined"
              size="sm"
              onClick={() => {
                setSelectedChatId(null);
                setInitialChat(null);
              }}
            >
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
            onSelect={(chatId) => {
              setSelectedChatId(chatId);
              setInitialChat(null);
            }}
            onNewChat={() => {
              setSelectedChatId(null);
              setInitialChat(null);
            }}
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
            onClick={() => {
              setSelectedChatId(null);
              setInitialChat(null);
            }}
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

      {(needsNoteReload || noteReloadFailed) && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            {noteReloadFailed
              ? 'Couldn’t refresh the note. Try again.'
              : 'The assistant updated this note.'}
          </p>
          <Button
            variant="outlined"
            size="sm"
            onClick={reloadNoteContent}
            disabled={isReloadingNote}
            className="shrink-0"
          >
            {isReloadingNote ? <Loader size="sm" /> : 'Reload'}
          </Button>
        </div>
      )}

      <ChatComposer
        value={draft}
        onChange={updateDraft}
        onSend={handleSend}
        onStop={chatState.cancel}
        busy={composerBusy}
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
