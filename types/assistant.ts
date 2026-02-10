// ── Assistant Types ──────────────────────────────────────────────────────────

export type AssistantRole = 'researcher' | 'funder';

export type InputType =
  | 'author_lookup'
  | 'topic_select'
  | 'nonprofit_lookup'
  | 'contact_lookup'
  | 'final_review'
  | 'rich_editor'
  | null;

export type FieldStatus = 'ai_suggested' | 'complete' | 'empty';

// ── API DTOs (snake_case to match backend) ──────────────────────────────────

export type AssistantChatAction = 'start' | 'resume' | 'message';

export interface AssistantChatRequest {
  session_id?: string;
  role?: AssistantRole;
  action: AssistantChatAction;
  message?: string;
  note_id?: string;
  structured_input?: {
    field: string;
    value: any;
  };
}

export interface AssistantChatResponse {
  session_id: string;
  message: string;
  follow_up?: string | null;
  input_type: InputType;
  editor_field?: string | null;
  note_id?: string | null;
  quick_replies: QuickReply[] | null;
  field_updates: Record<string, FieldUpdate> | null;
  payload: object | null;
  complete: boolean;
}

export interface CreateSessionRequest {
  role: AssistantRole;
}

export interface CreateSessionResponse {
  session_id: string;
}

export interface AssistantSessionResponse {
  session_id: string;
  role: AssistantRole;
  note_id: string | null;
  field_state: Record<string, FieldUpdate>;
  is_complete: boolean;
}

// ── Shared Value Types (camelCase) ──────────────────────────────────────────

export interface QuickReply {
  label: string;
  value: string | null;
}

export interface FieldUpdate {
  status: FieldStatus;
  value: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
}

// ── Chat State (camelCase) ──────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  followUp?: string;
  inputType?: InputType;
  editorField?: string;
  timestamp: number;
}

export interface EditorPanelState {
  isOpen: boolean;
  field: string | null;
  content: string | null;
  contentJson: string | null;
}

export interface ChatState {
  sessionId: string | null;
  role: AssistantRole | null;
  noteId: string | null;
  messages: ChatMessage[];
  quickReplies: QuickReply[] | null;
  fieldState: Record<string, FieldUpdate>;
  editorPanel: EditorPanelState;
  isTyping: boolean;
  isComplete: boolean;
  payload: object | null;
}

// ── Reducer Actions (camelCase) ─────────────────────────────────────────────

export type ChatAction =
  | { type: 'SET_ROLE'; role: AssistantRole }
  | { type: 'SET_SESSION_ID'; sessionId: string }
  | { type: 'SET_NOTE_ID'; noteId: string }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | {
      type: 'ADD_BOT_MESSAGE';
      content: string;
      followUp?: string;
      inputType?: InputType;
      editorField?: string;
      noteId?: string;
      quickReplies?: QuickReply[] | null;
    }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'UPDATE_FIELDS'; updates: Record<string, FieldUpdate> }
  | { type: 'SET_COMPLETE'; payload: object }
  | { type: 'CLEAR_QUICK_REPLIES' }
  | { type: 'STAGE_EDITOR_CONTENT'; field: string; content?: string; contentJson?: string }
  | { type: 'OPEN_EDITOR'; field?: string; content?: string; contentJson?: string }
  | { type: 'CLOSE_EDITOR' }
  | {
      type: 'HYDRATE_SESSION';
      sessionId: string;
      role: AssistantRole;
      noteId: string | null;
      fieldState: Record<string, FieldUpdate>;
    }
  | { type: 'RESET' };

// ── Note: Inline component search types use existing types from ──────────────
// @/types/search (UserSuggestion), @/types/topic (Topic), @/types/nonprofit (NonprofitOrg)
