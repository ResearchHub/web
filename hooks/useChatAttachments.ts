'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { AgentFileService } from '@/services/agentFile.service';
import type { SendOutcome } from '@/services/notebookChat.service';
import {
  createChatAttachmentsStore,
  type ChatAttachmentsStore,
  type ComposerAttachment,
} from '@/store/chatAttachments';
import type { AgentChat } from '@/types/agentChat';
import { DEFAULT_AGENT_FILE_LIMITS, type AgentFile, type AgentFileLimits } from '@/types/agentFile';

const NO_ATTACHMENTS: readonly ComposerAttachment[] = [];
const subscribeToNothing = () => () => undefined;

let sharedStore: ChatAttachmentsStore | null = null;

/** One store per page load, so an upload outlives the panel that started it. */
function getStore(): ChatAttachmentsStore {
  if (sharedStore == null) {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      storage = null;
    }
    sharedStore = createChatAttachmentsStore({ files: AgentFileService, storage });
  }
  return sharedStore;
}

/** The upload limits in effect: the server's once read, its defaults until then. */
export function useAgentFileLimits(): AgentFileLimits {
  const store = useMemo(() => (typeof window === 'undefined' ? null : getStore()), []);
  return useSyncExternalStore(
    store?.subscribe ?? subscribeToNothing,
    () => store?.limits() ?? DEFAULT_AGENT_FILE_LIMITS,
    () => DEFAULT_AGENT_FILE_LIMITS
  );
}

/** For `settle` when a send never reached the server. */
export const UNSENT: SendOutcome = { ok: false, reason: 'error' };

/** Files taken for one send, with the bucket they came from. */
export interface HeldAttachments {
  readonly owner: string | null;
  readonly chatId: number | null;
  readonly files: AgentFile[];
}

export interface ChatAttachments {
  /** The open chat's unsent files, less any going out with a message right now. */
  readonly items: readonly ComposerAttachment[];
  /** Why the files last picked were turned away, if any were. */
  readonly notice: string | null;
  /** Nothing is still uploading, processing, or failed. */
  readonly ready: boolean;
  readonly add: (files: File[]) => void;
  readonly remove: (key: string) => void;
  /** Take the ready files for a send; they leave the composer until `settle`. */
  readonly hold: () => HeldAttachments;
  /** Move what was attached on the new-chat screen to the chat created for it. */
  readonly adopt: (held: HeldAttachments, chatId: number) => HeldAttachments;
  /** Sent files are done with; refused ones go back to the composer. */
  readonly settle: (held: HeldAttachments, outcome: SendOutcome) => void;
  /** Drop a deleted chat's unsent files. */
  readonly clear: (chatId: number) => void;
}

const bucketFor = (owner: string, chatId: number | null) => `${owner}|${chatId ?? 'new'}`;

interface UseChatAttachmentsOptions {
  /** The transport's key: attachments never cross surfaces or notes. */
  readonly scope: string;
  readonly chatId: number | null;
  /** The open chat, for the files it already holds. */
  readonly chat: AgentChat | null;
}

/**
 * Unsent attachments for the open chat. They are kept per chat like its draft,
 * so switching chats neither loses nor moves them, and unlike the draft they
 * come back after a reload, since the server still holds them.
 */
export function useChatAttachments({
  scope,
  chatId,
  chat,
}: UseChatAttachmentsOptions): ChatAttachments {
  const { data: session } = useSession();
  // Keyed by user so one account never sees another's files in the same tab.
  const owner = session?.userId ? `${session.userId}|${scope}` : null;
  const bucket = owner ? bucketFor(owner, chatId) : null;
  const store = useMemo(() => (typeof window === 'undefined' ? null : getStore()), []);

  const all = useSyncExternalStore(
    store?.subscribe ?? subscribeToNothing,
    () => (store && bucket ? store.list(bucket) : NO_ATTACHMENTS),
    () => NO_ATTACHMENTS
  );
  const items = useMemo(() => all.filter((item) => !item.sending), [all]);

  useEffect(() => {
    if (!store || !bucket) return;
    void store.loadLimits();
    void store.restore(bucket);
  }, [store, bucket]);

  const [refusal, setRefusal] = useState<{ bucket: string; text: string } | null>(null);
  const notice = refusal?.bucket === bucket ? refusal.text : null;

  const sentCount = useMemo(
    () =>
      chat?.conversation_id === chatId
        ? chat.messages.reduce((count, message) => count + (message.attachments?.length ?? 0), 0)
        : 0,
    [chat, chatId]
  );

  const add = useCallback(
    (files: File[]) => {
      if (!store || !bucket) return;
      const text = store.add(bucket, files, sentCount);
      setRefusal(text ? { bucket, text } : null);
    },
    [store, bucket, sentCount]
  );

  const remove = useCallback(
    (key: string) => {
      store?.remove(key);
      setRefusal(null);
    },
    [store]
  );

  // Holds not settled yet; a host that unmounts mid-send must not leave files hidden.
  const unsettledRef = useRef(new Set<HeldAttachments>());

  const hold = useCallback((): HeldAttachments => {
    setRefusal(null);
    const held = { owner, chatId, files: store && bucket ? store.hold(bucket) : [] };
    unsettledRef.current.add(held);
    return held;
  }, [store, bucket, owner, chatId]);

  const adopt = useCallback(
    (held: HeldAttachments, nextChatId: number): HeldAttachments => {
      if (store && held.owner) {
        store.move(bucketFor(held.owner, held.chatId), bucketFor(held.owner, nextChatId));
      }
      const adopted = { ...held, chatId: nextChatId };
      if (unsettledRef.current.delete(held)) unsettledRef.current.add(adopted);
      return adopted;
    },
    [store]
  );

  const settle = useCallback(
    (held: HeldAttachments, outcome: SendOutcome) => {
      unsettledRef.current.delete(held);
      if (!store || !held.owner || held.files.length === 0) return;
      const heldBucket = bucketFor(held.owner, held.chatId);
      store.release(
        heldBucket,
        held.files.map((file) => file.id),
        outcome.ok
      );
      // The refusal names one file; the others' states may be stale too.
      if (!outcome.ok && outcome.code?.startsWith('attachment_')) void store.reconcile(heldBucket);
    },
    [store]
  );

  useEffect(() => {
    const unsettled = unsettledRef.current;
    return () => {
      for (const held of unsettled) settle(held, UNSENT);
    };
  }, [settle]);

  const clear = useCallback(
    (target: number) => {
      if (!store || !owner) return;
      for (const item of store.list(bucketFor(owner, target))) store.remove(item.key);
    },
    [store, owner]
  );

  const ready = items.every((item) => item.phase === 'ready');
  return { items, notice, ready, add, remove, hold, adopt, settle, clear };
}
