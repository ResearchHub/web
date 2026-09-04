import { isActiveExecutionStatus, type NotebookChat } from '@/types/notebookChat';

interface KnownJob {
  noteId: string | number;
  chatId: number;
  executionId: number | null;
}
interface JobSnapshot {
  jobs: readonly KnownJob[];
  submitting: boolean;
  completed: number;
}
const EMPTY: JobSnapshot = { jobs: [], submitting: false, completed: 0 };
const accounts = new Map<string, JobSnapshot>();
const listeners = new Set<() => void>();

function publish(userId: string, snapshot: JobSnapshot): void {
  accounts.set(userId, snapshot);
  listeners.forEach((listener) => listener());
}

/** Only jobs observed in this session are known; server 409s remain authoritative. */
export const researchAiJobs = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(userId: string): JobSnapshot {
    return accounts.get(userId) ?? EMPTY;
  },
  getServerSnapshot(): JobSnapshot {
    return EMPTY;
  },
  reserve(userId: string): boolean {
    const current = this.getSnapshot(userId);
    if (current.submitting || current.jobs.length > 0) return false;
    publish(userId, { ...current, submitting: true });
    return true;
  },
  release(userId: string): void {
    publish(userId, { ...this.getSnapshot(userId), submitting: false });
  },
  track(userId: string, job: KnownJob): void {
    const current = this.getSnapshot(userId);
    const existing = current.jobs.find((item) => item.chatId === job.chatId);
    if (existing && (job.executionId == null || existing.executionId === job.executionId)) return;
    publish(userId, {
      ...current,
      jobs: [...current.jobs.filter((item) => item.chatId !== job.chatId), job],
    });
  },
  observe(userId: string, noteId: string | number, chat: NotebookChat): void {
    const active = chat.executions.find((execution) => isActiveExecutionStatus(execution.status));
    if (active) {
      this.track(userId, { noteId, chatId: chat.conversation_id, executionId: active.id });
      return;
    }
    const current = this.getSnapshot(userId);
    const known = current.jobs.find((item) => item.chatId === chat.conversation_id);
    // A GET that raced a 202 may not contain the accepted execution yet.
    if (
      !known ||
      (known.executionId != null && !chat.executions.some((item) => item.id === known.executionId))
    )
      return;
    this.forget(userId, chat.conversation_id);
  },
  forget(userId: string, chatId: number): void {
    const current = this.getSnapshot(userId);
    if (!current.jobs.some((job) => job.chatId === chatId)) return;
    publish(userId, {
      ...current,
      jobs: current.jobs.filter((job) => job.chatId !== chatId),
      completed: current.completed + 1,
    });
  },
};
