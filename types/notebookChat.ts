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

export const transformNotebookChatExecution = (raw: any): NotebookChatExecution => ({
  id: raw.id ?? 0,
  attempt: raw.attempt ?? 1,
  status: raw.status ?? 'PENDING',
  triggerMessageId: raw.trigger_message_id ?? null,
  retryOfId: raw.retry_of_id ?? null,
  stopReason: raw.stop_reason ?? null,
  assistantMessagePending: raw.assistant_message_pending ?? false,
  error: raw.error ? { code: raw.error.code ?? '', message: raw.error.message ?? '' } : null,
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
