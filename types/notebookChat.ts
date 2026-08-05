/**
 * Types for the notebook chat assistant (research_ai notebook chat API).
 *
 * Mirrors the backend chat representation: a conversation is a list of
 * published chat messages plus the execution rows (agent turns) that
 * produced them. An execution that is still RUNNING — or SUCCEEDED with its
 * assistant message not yet published — means the assistant is still working.
 */

export type NotebookChatRole = 'user' | 'assistant';

export type NotebookChatExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'INTERRUPTED'
  | 'CANCELLED';

export interface NotebookChatMessage {
  id: number;
  sequence: number;
  role: NotebookChatRole;
  content: string;
  /** Execution that generated this message; null for user messages. */
  executionId: number | null;
}

export interface NotebookChatExecutionError {
  code: string;
  message: string;
}

/**
 * `interrupted` is a call the turn never came back from — distinct from
 * `failed`, which is a tool that ran and returned an error.
 */
export type NotebookChatActivityStatus = 'in_progress' | 'succeeded' | 'failed' | 'interrupted';

/** A citable item a tool returned; the same shape for web and scholarly tools. */
export interface NotebookChatSource {
  title: string;
  url: string;
}

/**
 * One tool call the agent made, as the backend's curated projection exposes
 * it. Raw arguments, results, and error text never cross the API boundary —
 * `label` and the optional `detail` are the whole user-facing story of a step.
 */
export interface NotebookChatActivityEvent {
  /** Machine name, e.g. `edit_note`. Prefer `label` for display. */
  tool: string;
  label: string;
  status: NotebookChatActivityStatus;
  /** The search query or author name, when the tool has one. */
  detail: string | null;
  /**
   * Ordering timestamps, not measurements: parallel calls in one assistant
   * turn share trace rows, so differences are not per-call durations.
   */
  startedAt: string | null;
  finishedAt: string | null;
  /** Version a successful `edit_note` produced, for reloading an open editor. */
  noteVersionId: number | null;
  sources: NotebookChatSource[];
}

export interface NotebookChatExecution {
  id: number;
  attempt: number;
  status: NotebookChatExecutionStatus;
  triggerMessageId: number | null;
  retryOfId: number | null;
  stopReason: string | null;
  /** Succeeded with text the chat has not published yet — keep polling. */
  assistantMessagePending: boolean;
  error: NotebookChatExecutionError | null;
  /** Tool calls this turn made, in order. Empty until the agent runs one. */
  activity: NotebookChatActivityEvent[];
}

export interface NotebookChatConversation {
  conversationId: number | null;
  messages: NotebookChatMessage[];
  executions: NotebookChatExecution[];
}

export interface NotebookChatSubmitResult {
  conversationId: number;
  executionId: number;
}

export const transformNotebookChatMessage = (raw: any): NotebookChatMessage => ({
  id: raw.id ?? 0,
  sequence: raw.sequence ?? 0,
  role: raw.role === 'assistant' ? 'assistant' : 'user',
  content: raw.content ?? '',
  executionId: raw.execution_id ?? null,
});

const transformNotebookChatSource = (raw: any): NotebookChatSource => ({
  title: raw?.title ?? '',
  url: raw?.url ?? '',
});

export const transformNotebookChatActivityEvent = (raw: any): NotebookChatActivityEvent => ({
  tool: raw?.tool ?? '',
  label: raw?.label ?? '',
  status: raw?.status ?? 'succeeded',
  detail: raw?.detail ?? null,
  startedAt: raw?.started_at ?? null,
  finishedAt: raw?.finished_at ?? null,
  noteVersionId: raw?.note_version_id ?? null,
  sources: Array.isArray(raw?.sources) ? raw.sources.map(transformNotebookChatSource) : [],
});

export const transformNotebookChatExecution = (raw: any): NotebookChatExecution => ({
  id: raw.id ?? 0,
  attempt: raw.attempt ?? 1,
  status: raw.status ?? 'PENDING',
  triggerMessageId: raw.trigger_message_id ?? null,
  retryOfId: raw.retry_of_id ?? null,
  stopReason: raw.stop_reason ?? null,
  assistantMessagePending: raw.assistant_message_pending ?? false,
  error: raw.error ? { code: raw.error.code ?? '', message: raw.error.message ?? '' } : null,
  activity: Array.isArray(raw.activity) ? raw.activity.map(transformNotebookChatActivityEvent) : [],
});

export const transformNotebookChatConversation = (raw: any): NotebookChatConversation => ({
  conversationId: raw?.conversation_id ?? null,
  messages: Array.isArray(raw?.messages) ? raw.messages.map(transformNotebookChatMessage) : [],
  executions: Array.isArray(raw?.executions)
    ? raw.executions.map(transformNotebookChatExecution)
    : [],
});

/** An agent turn the chat should keep polling for. */
export function isNotebookChatExecutionActive(execution: NotebookChatExecution): boolean {
  return (
    execution.status === 'PENDING' ||
    execution.status === 'RUNNING' ||
    (execution.status === 'SUCCEEDED' && execution.assistantMessagePending)
  );
}

/**
 * Version of the note this turn last saved, or null if it wrote nothing.
 *
 * Read from the activity rather than the turn's status on purpose: an edit
 * that landed before the turn died is still a real change on disk.
 */
export function editedNoteVersionId(execution: NotebookChatExecution): number | null {
  let versionId: number | null = null;
  for (const event of execution.activity) {
    if (event.noteVersionId != null) versionId = event.noteVersionId;
  }
  return versionId;
}

/** Every source the turn cited, in order, with repeats across tools dropped. */
export function activitySources(execution: NotebookChatExecution): NotebookChatSource[] {
  const seen = new Set<string>();
  const sources: NotebookChatSource[] = [];
  for (const event of execution.activity) {
    for (const source of event.sources) {
      if (!source.url || seen.has(source.url)) continue;
      seen.add(source.url);
      sources.push(source);
    }
  }
  return sources;
}
