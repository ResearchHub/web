'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAIMode } from './AIModeContext';
import { untitledDraftTitle } from './copy';
import { useFundingIntent } from './start/useFundingIntent';
import { mostRecentChat, useWorkspaceTarget } from './useWorkspaceTarget';
import { documentTarget, type WorkspaceTarget } from './workspaceUrl';
import type { ChatNoticePolicy } from '@/components/AgentChat/chatNotices';
import {
  createFundingDraft,
  DOCUMENT_TYPE_BY_INTENT,
} from '@/components/Funding/createFundingDraft';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAgentChatList, type UseAgentChatListResult } from '@/hooks/useAgentChat';
import { useChatSession, type ChatSession } from '@/hooks/useChatSession';
import { getChatTransport } from '@/services/chatTransport';
import type { AgentChat, ChatNoteRef } from '@/types/agentChat';
import type { SelectedGrantDetails } from '@/types/grant';
import type { Note } from '@/types/note';

/** Matches the chat hook's own poll cadence, so a background turn's dot clears as fast as the open one. */
const LIST_POLL_INTERVAL_MS = 5000;

const NOTICES: ChatNoticePolicy = { noun: 'chat', usageLimit: 'inline' };

export interface AIModeChatState extends ChatSession {
  readonly target: WorkspaceTarget;
  /** The open chat; null on the start screen, on a new chat, and while the latest is being found. */
  readonly chatId: number | null;
  /** The open document's most recent chat is being looked up. */
  readonly resolvingChat: boolean;
  /** The open document's chats; empty on the start screen. */
  readonly list: UseAgentChatListResult;
  /** `list` is the open document's, not, for a render after a switch, the previous one's. */
  readonly listReady: boolean;
  /** A chat on the open document has a turn running. */
  readonly anyTurnActive: boolean;
  /**
   * What the next draft is: an RFP (`fund`) or a proposal (`need_funding`).
   * Named by the URL the door led to (`?new=rfp`), else the last one used.
   */
  readonly intent: FundingIntent;
  /** The RFP the next proposal answers, chosen on the start screen. */
  readonly selectedGrant: SelectedGrantDetails | null;
  readonly setSelectedGrant: (grant: SelectedGrantDetails | null) => void;
  /** Open one of the document's chats, or a new one. */
  readonly openChat: (chat: number | 'new') => void;
  /** Rename the open chat. */
  readonly rename: (title: string) => Promise<boolean>;
  /**
   * Delete one of the document's chats; deleting the open one opens the next
   * most recent, or a new chat. The document is never touched.
   */
  readonly deleteChat: (chatId: number) => Promise<boolean>;
  /** The open document; titled from the sidebar's list until it has loaded. */
  readonly note: ChatNoteRef | null;
  /** The open chat's title, a rename shown before the server confirms it; null for a new chat. */
  readonly chatTitle: string | null;
}

/**
 * Orchestration for the workspace: the open document's chats, the open
 * chat's session, selection through the URL, renames and deletes, and the
 * first message of a new draft, which creates the document and then its
 * chat. The session itself — the chat, its draft and the send path — is
 * `useChatSession`, shared with the notebook's panel; every chat here is the
 * notebook's kind, scoped to its document.
 */
export function useAIModeChat(): AIModeChatState {
  const { target: urlTarget, selectTarget } = useAIMode();
  const noteId = urlTarget.kind === 'document' ? urlTarget.noteId : null;
  const documentTransport = noteId != null ? getChatTransport({ noteId }) : null;
  // The start screen has no document yet. Its session still holds the draft
  // text, the model choice and the budget, on the assistant's transport;
  // the first message creates its chat on the new document's instead.
  const transport = documentTransport ?? getChatTransport({ noteId: null });

  const list = useAgentChatList(documentTransport, documentTransport != null);
  const listReady = documentTransport != null && list.scopeKey === documentTransport.key;
  const { target, chatId, resolving } = useWorkspaceTarget(list, documentTransport);
  const refreshList = list.refresh;
  const listRef = useRef(list.chats);
  listRef.current = listReady ? list.chats : [];
  const targetRef = useRef(target);
  targetRef.current = target;

  // ---- what the next draft is ----
  // A Publish menu item, the Drafts "+" or a New RFP / New proposal button
  // leads to the start screen for one side of the money; the URL says which,
  // so the screen does not ask and a reload keeps it. It becomes the side
  // remembered for a bare `/workspace`.
  const [rememberedIntent, rememberIntent] = useFundingIntent();
  const urlIntent = target.kind === 'new' ? (target.intent ?? null) : null;
  useEffect(() => {
    if (urlIntent) rememberIntent(urlIntent);
  }, [urlIntent, rememberIntent]);
  const intent = urlIntent ?? rememberedIntent;
  const [selectedGrant, setSelectedGrant] = useState<SelectedGrantDetails | null>(null);

  // ---- the first message of a new draft ----
  // It creates the document, then a chat on it, then goes out there. A note
  // created by an attempt whose chat then failed is kept here, so a retry
  // reuses it rather than leaving a second draft behind. It belongs to the
  // start screen it was made on.
  const { selectedOrg } = useOrganizationContext();
  const fundingDocuments = useFundingDocuments();
  const { addDraft } = fundingDocuments;
  const pendingNoteRef = useRef<Note | null>(null);
  const startScreenKey = target.kind === 'new' ? intent : null;
  useEffect(() => {
    pendingNoteRef.current = null;
  }, [startScreenKey]);
  const draftInitRef = useRef({ intent, selectedGrant, orgSlug: selectedOrg?.slug ?? null });
  draftInitRef.current = { intent, selectedGrant, orgSlug: selectedOrg?.slug ?? null };
  const createDraftTransport = useCallback(async () => {
    const { intent: side, selectedGrant: grant, orgSlug } = draftInitRef.current;
    if (!orgSlug) throw new Error('No organization to create the draft in');
    const note = await createFundingDraft({
      orgSlug,
      title: untitledDraftTitle(side),
      documentType: DOCUMENT_TYPE_BY_INTENT[side],
      // Only its author sees it until it is published.
      grouping: 'PRIVATE',
      selectedGrantId: grant?.id ?? null,
      existingNote: pendingNoteRef.current,
      onNoteCreated: (created) => {
        pendingNoteRef.current = created;
        addDraft(created);
      },
    });
    return getChatTransport({ noteId: note.id });
  }, [addDraft]);

  const onChatCreated = useCallback(
    (created: AgentChat) => {
      const current = targetRef.current;
      if (current.kind === 'document') {
        selectTarget(documentTarget(current.noteId, created.conversation_id));
        return;
      }
      const note = pendingNoteRef.current;
      if (note == null) return;
      // The RFP went with the draft it was picked for.
      setSelectedGrant(null);
      selectTarget(documentTarget(note.id, created.conversation_id));
    },
    [selectTarget]
  );

  const session = useChatSession({
    transport,
    chatId,
    enabled: true,
    onChatCreated,
    onListStale: refreshList,
    transportForNewChat: target.kind === 'new' ? createDraftTransport : undefined,
    notices: NOTICES,
  });
  const { chat } = session;
  const clearAttachments = session.attachments.clear;

  // ---- keep the document's chats fresh ----
  // The session refreshes them as the open chat's turns settle; poll while
  // any other chat on the document has a turn running, so its dot clears
  // without the user having to open it.
  const anyTurnActive = listReady && list.chats.some((item) => item.has_active_turn);
  useEffect(() => {
    if (!anyTurnActive) return;
    const timer = setInterval(() => {
      refreshList();
    }, LIST_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [anyTurnActive, refreshList]);

  // ---- choosing a chat ----
  const openChat = useCallback(
    (next: number | 'new') => {
      const current = targetRef.current;
      if (current.kind === 'document') selectTarget(documentTarget(current.noteId, next));
    },
    [selectTarget]
  );

  // The open chat was deleted somewhere else (or never was on this
  // document): the document opens on its most recent chat instead.
  const chatGone = chatId != null && chat.access === 'not_found';
  useEffect(() => {
    if (!chatGone || noteId == null) return;
    let cancelled = false;
    void refreshList().then(() => {
      if (!cancelled) selectTarget(documentTarget(noteId, 'latest'));
    });
    return () => {
      cancelled = true;
    };
  }, [chatGone, noteId, refreshList, selectTarget]);

  // ---- rename, shown before the server confirms it ----
  // A rename is the user's own words; making them wait for the PATCH just
  // flashes the old title back at them.
  const [pendingTitle, setPendingTitle] = useState<{ chatId: number; title: string } | null>(null);
  const rename = useCallback(
    async (title: string): Promise<boolean> => {
      if (chatId == null) return false;
      setPendingTitle({ chatId, title });
      const renamed = await chat.rename(title);
      setPendingTitle((current) => (current?.chatId === chatId ? null : current));
      if (renamed) refreshList();
      return renamed;
    },
    [chatId, chat, refreshList]
  );
  const listedTitle = listReady
    ? (list.chats.find((item) => item.id === chatId)?.title ?? null)
    : null;
  const chatTitle =
    chatId == null
      ? null
      : pendingTitle?.chatId === chatId
        ? pendingTitle.title
        : (chat.chat?.title ?? listedTitle);

  // ---- delete; the document stays ----
  const deleteChat = useCallback(
    async (id: number): Promise<boolean> => {
      if (documentTransport == null) return false;
      try {
        await documentTransport.deleteChat(id);
      } catch {
        return false;
      }
      clearAttachments(id);
      const current = targetRef.current;
      if (current.kind === 'document' && current.chat === id) {
        const next = mostRecentChat(listRef.current.filter((item) => item.id !== id));
        selectTarget(documentTarget(current.noteId, next?.id ?? 'new'));
      }
      refreshList();
      return true;
    },
    [documentTransport, selectTarget, refreshList, clearAttachments]
  );

  // ---- the open document ----
  const { drafts, published } = fundingDocuments;
  const listedTitleOfNote =
    noteId == null
      ? ''
      : ([...drafts, ...published].find((item) => item.id === noteId)?.title ?? '');
  const note = useMemo<ChatNoteRef | null>(
    () => (noteId == null ? null : { id: noteId, title: listedTitleOfNote }),
    [noteId, listedTitleOfNote]
  );

  return {
    ...session,
    target,
    chatId,
    resolvingChat: resolving,
    list,
    listReady,
    anyTurnActive,
    intent,
    selectedGrant,
    setSelectedGrant,
    openChat,
    rename,
    deleteChat,
    note,
    chatTitle,
  };
}
