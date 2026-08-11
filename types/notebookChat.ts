/**
 * Types for the notebook AI assistant chat (`/api/research_ai/notebook/...`).
 *
 * These mirror the wire format verbatim (snake_case) rather than going through
 * a camelCase transformer: the client's refetch/merge logic depends on subtle
 * response semantics (notably `activity` being *absent* vs `[]` on live
 * fetches), so keeping the shapes 1:1 with the API makes that logic auditable
 * against the backend contract.
 */

export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'INTERRUPTED'
  | 'CANCELLED';

/**
 * A turn is live while queued or running; every other status is terminal.
 * Takes any string so unknown statuses from newer backends safely read as
 * terminal.
 */
export function isActiveExecutionStatus(status: string): boolean {
  return status === 'PENDING' || status === 'RUNNING';
}

export type ActivityCallStatus = 'in_progress' | 'succeeded' | 'failed' | 'interrupted';

export interface ChatActivitySource {
  title: string | null;
  url: string;
}

export interface ChatNarrationActivity {
  type: 'narration';
  text: string;
  at: string;
}

export interface ChatToolCallActivity {
  type: 'tool_call';
  /** Machine name (e.g. `web_search`). Only used to pick an icon — new tools appear without notice. */
  tool: string;
  /** Human copy supplied by the backend; always rendered verbatim. */
  label: string;
  status: ActivityCallStatus;
  started_at: string | null;
  finished_at: string | null;
  /** Optional query/name behind the call, ≤200 chars. */
  detail?: string | null;
  /** Present only on a succeeded `edit_note`: the note version the agent produced. */
  note_version_id?: number | null;
  /** Citations (≤5), only on success. */
  sources?: ChatActivitySource[] | null;
}

export type ChatActivityItem = ChatNarrationActivity | ChatToolCallActivity;

export interface ExecutionPhase {
  /**
   * Coarse machine state — `queued` / `using_tool` / `responding` / `thinking`
   * today, but the backend adds states without notice, so treat it as
   * open-ended and never branch on it exhaustively.
   */
  state: string;
  /** Rendered verbatim as the live status line. */
  label: string;
  tool?: string | null;
}

export interface ChatExecutionError {
  code: string;
  /** User-safe copy — render verbatim, never invent detail. */
  message: string;
}

export interface ChatExecution {
  id: number;
  attempt: number;
  status: ExecutionStatus;
  /** The user message that started this turn. */
  trigger_message_id: number | null;
  retry_of_id: number | null;
  context_parent_id: number | null;
  /** Informational only; never branch on it. */
  stop_reason: string | null;
  started_at: string | null;
  finished_at: string | null;
  /** Heartbeat, stamped on every durable write. */
  last_activity_at: string | null;
  iterations: number;
  max_iterations: number;
  /** True while the turn succeeded but its answer hasn't landed in `messages` yet. */
  assistant_message_pending: boolean;
  error: ChatExecutionError | null;
  /**
   * Ordered feed of what the agent did. On `?activity=live` fetches the key is
   * OMITTED for executions the server knows the client already holds settled —
   * absent means "unchanged, keep your cached copy" while `[]` legitimately
   * means "no tools used". The merge in useNotebookChat normalizes this so
   * consumers can rely on the field being present.
   */
  activity?: ChatActivityItem[];
  /** Coarse live status; null once the turn is terminal. */
  phase: ExecutionPhase | null;
}

export interface ChatMessage {
  id: number;
  sequence: number;
  role: 'user' | 'assistant';
  content: string;
  /** For assistant messages: the execution that produced this answer. */
  execution_id: number | null;
}

export interface NotebookChat {
  conversation_id: number;
  title: string | null;
  messages: ChatMessage[];
  /** Ordered oldest → newest. */
  executions: ChatExecution[];
}

export interface NotebookChatListItem {
  id: number;
  title: string | null;
  created_date: string;
  updated_date: string;
  /** First 160 chars of the newest message, null if the chat is empty. */
  last_message_preview: string | null;
  /** True while a turn is queued/running — show a spinner in the picker. */
  has_active_turn: boolean;
}

export interface SendMessageResponse {
  conversation_id: number;
  execution_id: number;
}

export interface CancelTurnResponse {
  cancelled: boolean;
  execution_id: number | null;
}

/** Socket events carry identifiers only — on any event, refetch. */
export interface ChatSocketEvent {
  conversation_id: number;
  execution_id: number | null;
  kind: string;
}

export const MAX_CHAT_MESSAGE_LENGTH = 20_000;
export const MAX_CHAT_TITLE_LENGTH = 255;
