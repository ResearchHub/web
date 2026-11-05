import { AgentFileUploadError, agentFileErrorMessage } from '@/services/agentFile.service';
import type { AgentFileService } from '@/services/agentFile.service';
import { chatErrorCode, chatErrorStatus } from '@/services/notebookChat.service';
import {
  DEFAULT_AGENT_FILE_LIMITS,
  agentFileRefusal,
  tooManyFilesPerChat,
  tooManyFilesPerMessage,
  type AgentFile,
  type AgentFileCreateResponse,
  type AgentFileLimits,
} from '@/types/agentFile';

export type AttachmentPhase = 'uploading' | 'processing' | 'ready' | 'failed';

/** One file in a composer, from the moment it is picked until it is sent or removed. */
export interface ComposerAttachment {
  readonly key: string;
  readonly filename: string;
  readonly sizeBytes: number;
  readonly phase: AttachmentPhase;
  /** Share of the bytes sent, 0–1, while uploading. */
  readonly progress: number;
  /** Processing has run long enough to be a scan going through OCR. */
  readonly slow: boolean;
  /** The server's view, once the upload exists there. */
  readonly file: AgentFile | null;
  readonly error: string | null;
  /** Out of the composer while the message carrying it is being sent. */
  readonly sending: boolean;
}

type FileApi = Pick<
  typeof AgentFileService,
  | 'createUpload'
  | 'uploadToStorage'
  | 'completeUpload'
  | 'getFile'
  | 'deleteFile'
  | 'listUnsent'
  | 'getLimits'
>;

const STORAGE_KEY = 'researchhub.chatAttachments.v1';
const EMPTY: readonly ComposerAttachment[] = [];
const COMPLETE_ATTEMPTS = 4;
const COMPLETE_RETRY_MS = 1000;
const SLOW_AFTER_MS = 15_000;
const PROCESSING_FAILED = 'This file could not be processed. Try uploading it again.';
const FILE_GONE = 'This file is no longer available. Remove it and attach it again.';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Quick at first, since most files are read in seconds; the server ends a stuck one. */
function pollDelay(attempt: number, elapsedMs: number): number {
  return Math.min(1000 * 1.5 ** attempt, elapsedMs > 120_000 ? 15_000 : 5000);
}

function readPersisted(storage: Pick<Storage, 'getItem'> | null): Map<string, number[]> {
  const persisted = new Map<string, number[]>();
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
    if (parsed == null || typeof parsed !== 'object') return persisted;
    for (const [bucket, ids] of Object.entries(parsed)) {
      if (!Array.isArray(ids)) continue;
      const valid = ids.filter((id): id is number => Number.isInteger(id) && id > 0);
      if (valid.length > 0) persisted.set(bucket, valid);
    }
  } catch {
    // Unreadable storage only costs the restore.
  }
  return persisted;
}

/** Whether the checks can run on a limits response; one they cannot is as good as none. */
function usable(limits: Partial<AgentFileLimits> | null): limits is AgentFileLimits {
  return (
    Array.isArray(limits?.supported_types) &&
    [limits.max_file_bytes, limits.max_files_per_message, limits.max_files_per_conversation].every(
      Number.isFinite
    )
  );
}

function serverState(
  file: AgentFile
): Pick<ComposerAttachment, 'file' | 'filename' | 'sizeBytes' | 'phase' | 'error'> {
  let phase: AttachmentPhase = 'processing';
  if (file.status === 'READY') phase = 'ready';
  else if (file.status === 'FAILED') phase = 'failed';
  return {
    file,
    filename: file.filename,
    sizeBytes: file.size_bytes,
    phase,
    error: phase === 'failed' ? (file.error ?? PROCESSING_FAILED) : null,
  };
}

/**
 * Unsent attachments for every chat, keyed by a caller-chosen bucket. Uploads
 * and polls run here rather than in a component, so they finish in the chat
 * they were started in whichever chat is on screen. The ids of files the
 * server knows are kept in `storage`, so a reload finds them again.
 */
export function createChatAttachmentsStore({
  files,
  storage,
}: {
  files: FileApi;
  storage: Pick<Storage, 'getItem' | 'setItem'> | null;
}) {
  const buckets = new Map<string, readonly ComposerAttachment[]>();
  const listeners = new Set<() => void>();
  const uploads = new Map<string, AbortController>();
  const polling = new Set<string>();
  // Persisted ids not loaded into a bucket yet.
  const unresolved = readPersisted(storage);
  const restoring = new Set<string>();
  let limits = DEFAULT_AGENT_FILE_LIMITS;
  // 'current' once the server's limits are read. The list of unsent files and a
  // message of files alone shipped with them, so neither is tried on any other.
  let server: 'unknown' | 'asking' | 'current' | 'older' = 'unknown';
  // Uploads refused for want of an unsent slot, kept to start again once there is room.
  const crowdedOut = new Map<string, File>();
  // The caller's unsent files, listed when such a refusal arrives.
  let unsent: readonly AgentFile[] | null = null;
  let listing = false;
  let sequence = 0;
  let written = '';

  const list = (bucket: string) => buckets.get(bucket) ?? EMPTY;
  const notify = () => listeners.forEach((listener) => listener());

  const persist = () => {
    const snapshot: Record<string, number[]> = {};
    for (const bucket of new Set([...unresolved.keys(), ...buckets.keys()])) {
      const ids = [
        ...(unresolved.get(bucket) ?? []),
        ...list(bucket).flatMap((item) => (item.file ? [item.file.id] : [])),
      ];
      if (ids.length > 0) snapshot[bucket] = ids;
    }
    const next = JSON.stringify(snapshot);
    if (next === written) return;
    written = next;
    try {
      storage?.setItem(STORAGE_KEY, next);
    } catch {
      // Without storage the attachments simply do not survive a reload.
    }
  };

  const write = (bucket: string, items: readonly ComposerAttachment[]) => {
    if (items.length > 0) buckets.set(bucket, items);
    else buckets.delete(bucket);
    persist();
    notify();
  };

  const locate = (key: string): [string, ComposerAttachment] | null => {
    for (const [bucket, items] of buckets) {
      const item = items.find((candidate) => candidate.key === key);
      if (item) return [bucket, item];
    }
    return null;
  };

  /** False when the attachment was removed meanwhile. */
  const patch = (key: string, changes: Partial<ComposerAttachment>): boolean => {
    const found = locate(key);
    if (!found) return false;
    const [bucket, item] = found;
    write(
      bucket,
      list(bucket).map((candidate) => (candidate === item ? { ...item, ...changes } : candidate))
    );
    return true;
  };

  const drop = (key: string) => {
    const found = locate(key);
    if (!found) return;
    const [bucket, item] = found;
    write(
      bucket,
      list(bucket).filter((candidate) => candidate !== item)
    );
  };

  const discard = (fileId: number) => {
    files.deleteFile(fileId).catch(() => undefined);
  };

  /** List what holds the unsent slots; without the list the refusal stands as the server worded it. */
  const survey = async () => {
    if (server !== 'current' || listing) return;
    listing = true;
    try {
      unsent = await files.listUnsent();
    } catch {
      unsent = null;
    } finally {
      listing = false;
      notify();
    }
  };

  /** Listed files holding a slot outside `bucket`, while an upload there waits for one. */
  const outside = (bucket: string): AgentFile[] => {
    if (unsent == null || !list(bucket).some((item) => crowdedOut.has(item.key))) return [];
    const kept = new Set(unresolved.get(bucket));
    for (const [owner, items] of buckets) {
      for (const item of items) {
        // A file going out with a message is unsent until the server takes it.
        if (item.file && (owner === bucket || item.sending)) kept.add(item.file.id);
      }
    }
    return unsent.filter((file) => file.status !== 'FAILED' && !kept.has(file.id));
  };

  /** One status read: the file, why it can no longer be had, or null to read again. */
  const readStatus = async (fileId: number): Promise<AgentFile | { gone: string } | null> => {
    try {
      return await files.getFile(fileId);
    } catch (error) {
      const status = chatErrorStatus(error);
      if (status === 404) return { gone: FILE_GONE };
      if (status === 401 || status === 403) {
        return { gone: agentFileErrorMessage(error, PROCESSING_FAILED) };
      }
      return null;
    }
  };

  const poll = async (key: string, fileId: number) => {
    if (polling.has(key)) return;
    polling.add(key);
    const startedAt = Date.now();
    try {
      for (let attempt = 0; ; attempt += 1) {
        await sleep(pollDelay(attempt, Date.now() - startedAt));
        const item = locate(key)?.[1];
        if (!item) return;
        if (!item.slow && Date.now() - startedAt > SLOW_AFTER_MS) patch(key, { slow: true });
        const read = await readStatus(fileId);
        if (read == null) continue;
        if ('gone' in read) {
          patch(key, { phase: 'failed', error: read.gone });
          return;
        }
        if (!patch(key, serverState(read))) return;
        if (read.status === 'READY' || read.status === 'FAILED') return;
      }
    } finally {
      polling.delete(key);
    }
  };

  const complete = async (key: string, fileId: number) => {
    for (let attempt = 1; ; attempt += 1) {
      try {
        const file = await files.completeUpload(fileId);
        if (!patch(key, serverState(file))) return;
        if (file.status !== 'READY' && file.status !== 'FAILED') void poll(key, fileId);
        return;
      } catch (error) {
        if (!locate(key)) return;
        // The object can trail the upload's own response by a moment.
        if (chatErrorCode(error) === 'upload_incomplete' && attempt < COMPLETE_ATTEMPTS) {
          await sleep(COMPLETE_RETRY_MS);
          continue;
        }
        patch(key, {
          phase: 'failed',
          error: agentFileErrorMessage(error, 'The upload could not be finished.'),
        });
        return;
      }
    }
  };

  const upload = async (key: string, source: File) => {
    let created: AgentFileCreateResponse;
    try {
      created = await files.createUpload({
        filename: source.name,
        sizeBytes: source.size,
        contentType: source.type,
      });
    } catch (error) {
      const shown = patch(key, {
        phase: 'failed',
        error: agentFileErrorMessage(error, 'The upload could not be started.'),
      });
      if (shown && chatErrorCode(error) === 'too_many_unsent_files') {
        crowdedOut.set(key, source);
        void survey();
      }
      return;
    }
    const { upload: form, ...file } = created;
    if (!patch(key, { file, filename: file.filename })) {
      discard(file.id);
      return;
    }
    const controller = new AbortController();
    uploads.set(key, controller);
    let percent = 0;
    try {
      await files.uploadToStorage(form, source, {
        signal: controller.signal,
        onProgress: (fraction) => {
          const next = Math.round(fraction * 100);
          if (next === percent) return;
          percent = next;
          patch(key, { progress: fraction });
        },
      });
    } catch (error) {
      if (error instanceof AgentFileUploadError && error.aborted) return;
      patch(key, {
        phase: 'failed',
        error: agentFileErrorMessage(error, 'The file could not be uploaded.'),
      });
      return;
    } finally {
      uploads.delete(key);
    }
    if (!patch(key, { phase: 'processing', progress: 1 })) return;
    await complete(key, file.id);
  };

  /** The file behind a persisted id, null when it is gone or sent, 'later' when unknown. */
  const lookUp = async (fileId: number): Promise<AgentFile | null | 'later'> => {
    let file: AgentFile;
    try {
      file = await files.getFile(fileId);
    } catch (error) {
      return chatErrorStatus(error) === 404 ? null : 'later';
    }
    if (file.message_id != null) return null;
    if (file.status !== 'UPLOADING') return file;
    // The page that was sending the bytes is gone; keep the file only if they landed.
    try {
      return await files.completeUpload(fileId);
    } catch {
      discard(fileId);
      return null;
    }
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    list,

    limits: () => limits,

    takesFilesAlone: () => server === 'current',

    /** Read the server's limits; safe to call often. A server without the route is asked once. */
    loadLimits: async () => {
      if (server !== 'unknown') return;
      server = 'asking';
      try {
        const published = await files.getLimits();
        if (!usable(published)) throw new Error('Unusable file limits');
        limits = published;
        server = 'current';
        notify();
      } catch (error) {
        server = chatErrorStatus(error) === 404 ? 'older' : 'unknown';
      }
    },

    outside,

    /** Remove the unsent files outside `bucket`, then start the uploads that had no slot. */
    makeRoom: async (bucket: string) => {
      const targets = outside(bucket);
      if (targets.length === 0) return;
      unsent = null;
      const ids = new Set(targets.map((file) => file.id));
      for (const [other, pending] of [...unresolved]) {
        const left = pending.filter((id) => !ids.has(id));
        if (left.length > 0) unresolved.set(other, left);
        else unresolved.delete(other);
      }
      for (const item of [...buckets.values()].flat()) {
        if (item.file == null || !ids.has(item.file.id)) continue;
        uploads.get(item.key)?.abort();
        drop(item.key);
      }
      const waiting = [...crowdedOut];
      crowdedOut.clear();
      for (const [key] of waiting) patch(key, { phase: 'uploading', progress: 0, error: null });
      await Promise.all(targets.map((file) => files.deleteFile(file.id).catch(() => undefined)));
      for (const [key, source] of waiting) {
        if (locate(key)) void upload(key, source);
      }
    },

    /** Load the files persisted for `bucket` before a reload; safe to call often. */
    restore: async (bucket: string) => {
      const ids = unresolved.get(bucket);
      if (!ids || restoring.has(bucket)) return;
      restoring.add(bucket);
      try {
        const results = await Promise.all(ids.map(lookUp));
        const later = ids.filter((_, index) => results[index] === 'later');
        if (later.length > 0) unresolved.set(bucket, later);
        else unresolved.delete(bucket);
        const found = results.filter(
          (result): result is AgentFile => result != null && result !== 'later'
        );
        const restored = found.map(
          (file): ComposerAttachment => ({
            key: `file-${file.id}`,
            progress: 1,
            slow: false,
            sending: false,
            ...serverState(file),
          })
        );
        write(bucket, [...restored, ...list(bucket)]);
        for (const file of found) {
          if (file.status === 'PROCESSING') void poll(`file-${file.id}`, file.id);
        }
      } finally {
        restoring.delete(bucket);
      }
    },

    /**
     * Start uploading the files that pass the server's own checks. Returns why
     * the others were turned away, or null. `sentCount` is how many files the
     * chat already holds.
     */
    add: (bucket: string, picked: readonly File[], sentCount: number): string | null => {
      const current = list(bucket);
      let roomInMessage =
        limits.max_files_per_message - current.filter((item) => !item.sending).length;
      let roomInChat = limits.max_files_per_conversation - sentCount - current.length;
      const accepted: File[] = [];
      const refused: string[] = [];
      const reasons = new Set<string>();
      for (const file of picked) {
        let reason = agentFileRefusal(file, limits);
        if (reason == null && roomInMessage <= 0) reason = tooManyFilesPerMessage(limits);
        if (reason == null && roomInChat <= 0) reason = tooManyFilesPerChat(limits);
        if (reason != null) {
          refused.push(file.name);
          reasons.add(reason);
          continue;
        }
        roomInMessage -= 1;
        roomInChat -= 1;
        accepted.push(file);
      }
      if (accepted.length > 0) {
        const items = accepted.map((file): ComposerAttachment => {
          sequence += 1;
          return {
            key: `local-${sequence}`,
            filename: file.name,
            sizeBytes: file.size,
            phase: 'uploading',
            progress: 0,
            slow: false,
            file: null,
            error: null,
            sending: false,
          };
        });
        write(bucket, [...current, ...items]);
        items.forEach((item, index) => void upload(item.key, accepted[index]));
      }
      if (refused.length === 0) return null;
      const subject =
        refused.length === 1
          ? `“${refused[0]}” wasn’t attached.`
          : `${refused.length} files weren’t attached.`;
      return `${subject} ${[...reasons].join(' ')}`;
    },

    /** Also deletes the file on the server, where it would otherwise wait to expire. */
    remove: (key: string) => {
      const found = locate(key);
      if (!found) return;
      uploads.get(key)?.abort();
      if (crowdedOut.delete(key) && crowdedOut.size === 0) unsent = null;
      drop(key);
      if (found[1].file) discard(found[1].file.id);
    },

    /** Take the ready files for a send, hiding them until `release`. */
    hold: (bucket: string): AgentFile[] => {
      const taken = list(bucket).filter(
        (item) => item.phase === 'ready' && item.file != null && !item.sending
      );
      if (taken.length > 0) {
        write(
          bucket,
          list(bucket).map((item) => (taken.includes(item) ? { ...item, sending: true } : item))
        );
      }
      return taken.flatMap((item) => (item.file ? [item.file] : []));
    },

    /** Sent files leave the store; refused ones return to the composer. */
    release: (bucket: string, fileIds: readonly number[], sent: boolean) => {
      const held = (item: ComposerAttachment) =>
        item.file != null && fileIds.includes(item.file.id);
      write(
        bucket,
        sent
          ? list(bucket).filter((item) => !held(item))
          : list(bucket).map((item) => (held(item) ? { ...item, sending: false } : item))
      );
    },

    /** A chat created for its first message takes over what was attached before it existed. */
    move: (from: string, to: string) => {
      if (from === to) return;
      const pending = unresolved.get(from);
      if (pending) {
        unresolved.set(to, [...(unresolved.get(to) ?? []), ...pending]);
        unresolved.delete(from);
      }
      const moved = list(from);
      buckets.delete(from);
      write(to, [...list(to), ...moved]);
    },

    /** Re-read every file after the server refused a send over one of them. */
    reconcile: async (bucket: string) => {
      const known = list(bucket).filter((item) => item.file != null && item.phase !== 'uploading');
      await Promise.all(
        known.map(async (item) => {
          if (item.file == null) return;
          try {
            const file = await files.getFile(item.file.id);
            if (file.message_id != null) {
              drop(item.key);
              return;
            }
            patch(item.key, serverState(file));
            if (file.status === 'PROCESSING') void poll(item.key, file.id);
          } catch (error) {
            if (chatErrorStatus(error) === 404) {
              patch(item.key, { phase: 'failed', error: FILE_GONE });
            }
          }
        })
      );
    },
  };
}

export type ChatAttachmentsStore = ReturnType<typeof createChatAttachmentsStore>;
