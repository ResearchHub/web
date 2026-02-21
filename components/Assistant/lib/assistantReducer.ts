import type { ChatState, ChatAction, AssistantRole, FieldUpdate } from '@/types/assistant';
import { getInitialFieldState } from './fieldDefinitions';

// ── Initial State Factory ───────────────────────────────────────────────────

const initialEditorPanel = {
  isOpen: false,
  field: null,
  content: null,
  contentJson: null,
} as const;

export function createInitialState(role?: AssistantRole | null): ChatState {
  return {
    sessionId: null,
    role: role ?? null,
    noteId: null,
    messages: [],
    quickReplies: null,
    fieldState: role ? getInitialFieldState(role) : {},
    editorPanel: { ...initialEditorPanel },
    isTyping: false,
    isComplete: false,
    payload: null,
  };
}

// ── Reducer ─────────────────────────────────────────────────────────────────

let msgIdCounter = 0;

function nextMsgId(): string {
  return `msg-${Date.now()}-${++msgIdCounter}`;
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_ROLE': {
      const fieldState = getInitialFieldState(action.role);
      return { ...state, role: action.role, fieldState };
    }

    case 'SET_SESSION_ID': {
      return { ...state, sessionId: action.sessionId };
    }

    case 'SET_NOTE_ID': {
      return { ...state, noteId: action.noteId };
    }

    case 'ADD_USER_MESSAGE': {
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: nextMsgId(), role: 'user', content: action.content, timestamp: Date.now() },
        ],
        quickReplies: null,
      };
    }

    case 'ADD_BOT_MESSAGE': {
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: nextMsgId(),
            role: 'bot',
            content: action.content,
            followUp: action.followUp,
            inputType: action.inputType,
            editorField: action.editorField,
            timestamp: Date.now(),
          },
        ],
        quickReplies: action.quickReplies ?? null,
        noteId: action.noteId ?? state.noteId,
        isTyping: false,
      };
    }

    case 'SET_TYPING': {
      return { ...state, isTyping: action.isTyping };
    }

    case 'UPDATE_FIELDS': {
      const updatedFields: Record<string, FieldUpdate> = { ...state.fieldState };
      for (const [key, update] of Object.entries(action.updates)) {
        updatedFields[key] = update;
      }
      return { ...state, fieldState: updatedFields };
    }

    case 'SET_COMPLETE': {
      return { ...state, isComplete: true, payload: action.payload };
    }

    case 'CLEAR_QUICK_REPLIES': {
      return { ...state, quickReplies: null };
    }

    case 'STAGE_EDITOR_CONTENT': {
      return {
        ...state,
        editorPanel: {
          ...state.editorPanel,
          field: action.field,
          content: action.content ?? state.editorPanel.content,
          contentJson: action.contentJson ?? state.editorPanel.contentJson,
        },
      };
    }

    case 'OPEN_EDITOR': {
      return {
        ...state,
        editorPanel: {
          ...state.editorPanel,
          isOpen: true,
          field: action.field ?? state.editorPanel.field ?? 'description',
          content: action.content ?? state.editorPanel.content,
          contentJson: action.contentJson ?? state.editorPanel.contentJson,
        },
      };
    }

    case 'CLOSE_EDITOR': {
      // Just close — preserve content for next open
      return {
        ...state,
        editorPanel: {
          ...state.editorPanel,
          isOpen: false,
        },
      };
    }

    case 'DISCARD_STAGED': {
      // User explicitly rejected AI proposal — clear staged + close
      return {
        ...state,
        editorPanel: {
          ...initialEditorPanel,
        },
      };
    }

    case 'COMMIT_EDITOR': {
      // Content has been persisted to backend — clear staged + close
      return {
        ...state,
        editorPanel: {
          ...initialEditorPanel,
        },
      };
    }

    case 'HYDRATE_SESSION': {
      return {
        ...state,
        sessionId: action.sessionId,
        role: action.role,
        noteId: action.noteId,
        fieldState: action.fieldState,
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}
