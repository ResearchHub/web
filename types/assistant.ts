// ── Assistant Types ──────────────────────────────────────────────────────────

export type AssistantRole = 'researcher' | 'funder';

export type InputType =
  | 'author_lookup'
  | 'topic_select'
  | 'nonprofit_lookup'
  | 'final_review'
  | 'rich_editor'
  | null;

export type FieldStatus = 'draft' | 'complete' | 'skipped' | 'empty';

// ── API DTOs ────────────────────────────────────────────────────────────────

export interface AssistantChatRequest {
  session_id?: string;
  role?: AssistantRole;
  message: string;
  structured_input?: {
    field: string;
    value: any;
  };
}

export interface QuickReply {
  label: string;
  value: string | null;
}

export interface FieldUpdate {
  status: FieldStatus;
  value: string;
}

export interface AssistantChatResponse {
  session_id: string;
  message: string;
  follow_up?: string | null;
  input_type: InputType;
  editor_field?: string | null;
  quick_replies: QuickReply[] | null;
  field_updates: Record<string, FieldUpdate> | null;
  payload: object | null;
  complete: boolean;
}

export interface AssistantSubmitRequest {
  session_id: string;
}

export interface AssistantSubmitResponse {
  success: boolean;
  message: string;
  document_id?: number;
  document_type?: 'post' | 'grant';
}

// ── Chat State ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  followUp?: string;
  inputType?: InputType;
  editorField?: string;
  quickReplies?: QuickReply[] | null;
  timestamp: number;
}

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  inputMethod: string;
}

export interface EditorPanelState {
  isOpen: boolean;
  field: string | null;
  initialContent: string | null;
}

export interface ChatState {
  sessionId: string | null;
  role: AssistantRole | null;
  messages: ChatMessage[];
  quickReplies: QuickReply[] | null;
  fieldState: Record<string, FieldUpdate>;
  editorPanel: EditorPanelState;
  isTyping: boolean;
  isComplete: boolean;
  payload: object | null;
}

// ── Reducer Actions ─────────────────────────────────────────────────────────

export type ChatAction =
  | { type: 'SET_ROLE'; role: AssistantRole }
  | { type: 'SET_SESSION_ID'; sessionId: string }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | {
      type: 'ADD_BOT_MESSAGE';
      content: string;
      followUp?: string;
      inputType?: InputType;
      editorField?: string;
      quickReplies?: QuickReply[] | null;
    }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'UPDATE_FIELDS'; updates: Record<string, FieldUpdate> }
  | { type: 'SET_COMPLETE'; payload: object }
  | { type: 'CLEAR_QUICK_REPLIES' }
  | { type: 'OPEN_EDITOR'; field: string; content: string }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'RESET' };

// ── Inline Component Search Result Types ────────────────────────────────────

export interface AuthorSearchResult {
  id: number;
  name: string;
  headline?: string;
  profileImage?: string;
}

export interface HubSearchResult {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface NonprofitSearchResult {
  id: string;
  name: string;
  ein?: string;
  description?: string;
  logoUrl?: string;
}
