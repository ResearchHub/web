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

export interface ChatThinkingActivity {
  type: 'thinking';
  /** Readable reasoning from one assistant thinking block, ≤4000 chars. */
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

/**
 * A tool call the model is still composing, published from the moment the block
 * opens so the long stretch spent writing arguments isn't silent — an
 * `edit_note` can spend 8-18s emitting nothing but its own arguments.
 *
 * Preview-only: once the call is actually sent it appears as a `tool_call` in
 * durable activity, and the draft goes with the rest of the iteration's
 * preview.
 */
export interface ChatToolDraftActivity {
  type: 'tool_draft';
  /**
   * The prose extracted from the arguments so far. Empty for tools whose
   * arguments aren't prose — a search query is written in an instant, so only
   * the label is worth showing.
   */
  text: string;
  at: string;
  /** Machine name; empty when the provider skipped the block-start event. */
  tool: string;
  /** Human copy supplied by the backend; always rendered verbatim. */
  label: string;
}

/** What a settled turn durably records. */
export type ChatActivityItem = ChatNarrationActivity | ChatThinkingActivity | ChatToolCallActivity;

/** Everything the feed draws: durable activity plus the preview's own kinds. */
export type ChatFeedItem = ChatActivityItem | ChatToolDraftActivity;

/** A transient item assembled from WebSocket deltas while a model turn runs. */
export type ChatStreamItem = (
  | ChatNarrationActivity
  | ChatThinkingActivity
  | ChatToolDraftActivity
) & {
  /** Stable within one provider iteration. */
  id: string;
};

/** Bounded server checkpoint used to recover after a dropped socket frame. */
export interface ChatExecutionStream {
  /** Execution + provider iteration identity (for example `42:2`). */
  id: string;
  /** Monotonic within this stream id. */
  sequence: number;
  iteration: number;
  items: ChatStreamItem[];
}

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
  /**
   * Provider-prefixed ref of the model this turn was submitted with (e.g.
   * `claude_platform:claude-opus-5`). Empty on turns recorded before the
   * server tracked one; a conversation's first non-empty value is the model
   * every later turn on it runs, and cannot be changed.
   */
  model: string;
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
  /**
   * In-flight text/readable-thinking snapshot. Present for active executions;
   * null means an old local preview must be cleared. Terminal executions omit
   * it because their durable activity/message is authoritative.
   */
  stream?: ChatExecutionStream | null;
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

interface ChatSocketEventBase {
  conversation_id: number;
  execution_id: number | null;
  kind: string;
}

interface ChatStreamDeltaBase {
  id: string;
  delta: string;
  at: string;
}

/**
 * One frame of one stream item. A draft's frames all carry its identity — the
 * item keeps what its first one had — so these are required rather than
 * optional: the server sends them on every draft frame, and a frame without
 * them is a contract violation for the guard to reject, not a state to render.
 */
export type ChatStreamDelta =
  | (ChatStreamDeltaBase & { type: 'narration' | 'thinking' })
  | (ChatStreamDeltaBase & {
      type: 'tool_draft';
      /** Machine name; empty when the provider skipped the block-start event. */
      tool: string;
      /** Human copy supplied by the backend; always rendered verbatim. */
      label: string;
    });

export interface ChatStreamSocketEvent extends ChatSocketEventBase {
  execution_id: number;
  kind: 'stream_delta';
  stream_id: string;
  sequence: number;
  iteration: number;
  deltas: ChatStreamDelta[];
}

/** Lifecycle events are identifier-only refetch nudges. */
export type ChatSocketEvent = ChatSocketEventBase | ChatStreamSocketEvent;

export function isChatSocketEvent(value: unknown): value is ChatSocketEvent {
  if (value == null || typeof value !== 'object') return false;
  const candidate = value as Partial<ChatSocketEventBase>;
  return (
    typeof candidate.conversation_id === 'number' &&
    (candidate.execution_id == null || typeof candidate.execution_id === 'number') &&
    typeof candidate.kind === 'string'
  );
}

/** Runtime guard: WebSocket JSON crosses no schema-validation boundary. */
export function isChatStreamSocketEvent(event: ChatSocketEvent): event is ChatStreamSocketEvent {
  const candidate = event as Partial<ChatStreamSocketEvent>;
  return (
    event.kind === 'stream_delta' &&
    typeof event.execution_id === 'number' &&
    typeof candidate.stream_id === 'string' &&
    typeof candidate.sequence === 'number' &&
    Number.isInteger(candidate.sequence) &&
    typeof candidate.iteration === 'number' &&
    Array.isArray(candidate.deltas) &&
    candidate.deltas.length > 0 &&
    candidate.deltas.every(
      (delta) =>
        delta != null &&
        typeof delta.id === 'string' &&
        typeof delta.delta === 'string' &&
        typeof delta.at === 'string' &&
        (delta.type === 'narration' ||
          delta.type === 'thinking' ||
          (delta.type === 'tool_draft' &&
            typeof delta.tool === 'string' &&
            typeof delta.label === 'string'))
    )
  );
}

export const MAX_CHAT_MESSAGE_LENGTH = 20_000;
export const MAX_CHAT_TITLE_LENGTH = 255;
