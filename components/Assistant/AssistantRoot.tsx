'use client';

import React, { useReducer, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import type { AssistantRole, AssistantChatResponse } from '@/types/assistant';
import { AssistantService } from '@/services/assistant.service';
import { chatReducer, createInitialState } from './lib/assistantReducer';
import { OnboardingScreen } from './OnboardingScreen';
import { ChatScreen } from './ChatScreen';
import { EditorPanel } from './EditorPanel';
import { AssistantProgress } from './AssistantProgress';
import { BaseModal } from '@/components/ui/BaseModal';

/* ------------------------------------------------------------------ */
/*  Process API responses                                              */
/* ------------------------------------------------------------------ */
function handleChatResponse(response: AssistantChatResponse, dispatch: React.Dispatch<any>) {
  if (response.session_id) {
    dispatch({ type: 'SET_SESSION_ID', sessionId: response.session_id });
  }

  const editorField =
    response.editor_field ??
    (response.input_type === 'rich_editor' && response.field_updates
      ? Object.keys(response.field_updates)[0]
      : undefined);

  dispatch({
    type: 'ADD_BOT_MESSAGE',
    content: response.message,
    followUp: response.follow_up ?? undefined,
    inputType: response.input_type ?? undefined,
    editorField: editorField ?? undefined,
    quickReplies: response.quick_replies,
  });

  if (response.field_updates) {
    dispatch({ type: 'UPDATE_FIELDS', updates: response.field_updates });
  }

  if (response.input_type === 'rich_editor' && response.follow_up && editorField) {
    dispatch({ type: 'OPEN_EDITOR', field: editorField, content: response.follow_up });
  }

  if (response.complete && response.payload) {
    dispatch({ type: 'SET_COMPLETE', payload: response.payload });
  }
}

/* ================================================================== */
/*  AssistantRoot                                                      */
/* ================================================================== */
export const AssistantRoot: React.FC = () => {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const router = useRouter();
  const sessionIdRef = useRef(state.sessionId);
  sessionIdRef.current = state.sessionId;
  const hasInitialized = useRef(false);

  const role = state.role;
  const editorIsOpen = state.editorPanel.isOpen;

  // ── Role selection ────────────────────────────────────────────────────

  const handleSelectRole = useCallback((selectedRole: AssistantRole) => {
    dispatch({ type: 'SET_ROLE', role: selectedRole });
  }, []);

  // ── Initialize chat when role is set ──────────────────────────────────

  useEffect(() => {
    if (!role || hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      dispatch({ type: 'SET_TYPING', isTyping: true });
      try {
        const response = await AssistantService.chat({
          role,
          message: 'Hello, I want to get started.',
        });
        handleChatResponse(response, dispatch);
      } catch {
        dispatch({
          type: 'ADD_BOT_MESSAGE',
          content: 'Sorry, I had trouble connecting. Please try refreshing the page.',
        });
      }
    };

    initChat();
  }, [role]);

  // ── Send message (shared by ChatScreen + editor confirm) ─────────────

  const sendMessage = useCallback(
    async (content: string, structuredInput?: { field: string; value: any }) => {
      dispatch({ type: 'ADD_USER_MESSAGE', content });
      dispatch({ type: 'SET_TYPING', isTyping: true });

      try {
        const response = await AssistantService.chat({
          session_id: sessionIdRef.current ?? undefined,
          role: role ?? undefined,
          message: content,
          structured_input: structuredInput,
        });
        handleChatResponse(response, dispatch);
      } catch {
        dispatch({
          type: 'ADD_BOT_MESSAGE',
          content: 'Sorry, I hit a snag. Could you try again?',
        });
      }
    },
    [role]
  );

  // ── Submit completed session ──────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    dispatch({ type: 'SET_TYPING', isTyping: true });

    try {
      const result = await AssistantService.submit({ session_id: sid });
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        content: result.message || 'Your submission was created successfully!',
      });

      if (result.success && result.document_id) {
        const basePath = result.document_type === 'grant' ? '/fund' : '/post';
        setTimeout(() => router.push(`${basePath}/${result.document_id}`), 1500);
      }
    } catch {
      dispatch({
        type: 'ADD_BOT_MESSAGE',
        content: 'There was a problem submitting. Please try again.',
      });
    }
  }, [router]);

  // ── Field click (from sidebar) ────────────────────────────────────────

  const handleFieldClick = useCallback(
    (fieldKey: string) => {
      sendMessage(`Let's work on the ${fieldKey.replace(/_/g, ' ')} field`);
    },
    [sendMessage]
  );

  // ── Editor toggle ─────────────────────────────────────────────────────

  const handleToggleEditor = useCallback(() => {
    if (editorIsOpen) {
      dispatch({ type: 'CLOSE_EDITOR' });
    } else {
      const existing = state.fieldState.description?.value;
      dispatch({
        type: 'OPEN_EDITOR',
        field: 'description',
        content: existing || '<p></p>',
      });
    }
  }, [editorIsOpen, state.fieldState.description?.value]);

  const handleEditorConfirm = useCallback(
    (json: object) => {
      const field = state.editorPanel.field;
      if (!field) return;

      sendMessage(`I've finished editing the ${field.replace(/_/g, ' ')}.`, {
        field,
        value: JSON.stringify(json),
      });
      dispatch({ type: 'CLOSE_EDITOR' });
    },
    [state.editorPanel.field, sendMessage]
  );

  const handleEditorDiscard = useCallback(() => {
    dispatch({ type: 'CLOSE_EDITOR' });
  }, []);

  // ── Right sidebar ─────────────────────────────────────────────────────

  const rightSidebar = role ? (
    <AssistantProgress role={role} fieldState={state.fieldState} onFieldClick={handleFieldClick} />
  ) : (
    false
  );

  // ── Render ────────────────────────────────────────────────────────────

  if (!role) {
    return (
      <PageLayout rightSidebar={false}>
        <OnboardingScreen onSelectRole={handleSelectRole} />
      </PageLayout>
    );
  }

  return (
    <PageLayout rightSidebar={rightSidebar}>
      <ChatScreen
        role={role}
        state={state}
        dispatch={dispatch}
        sendMessage={sendMessage}
        onSubmit={handleSubmit}
        editorOpen={editorIsOpen}
        onToggleEditor={handleToggleEditor}
      />

      {/* Editor modal — EditorPanel has its own header with confirm/discard */}
      <BaseModal
        isOpen={editorIsOpen && !!state.editorPanel.field}
        onClose={handleEditorDiscard}
        showCloseButton={false}
        maxWidth="max-w-4xl"
        padding="p-0"
      >
        {state.editorPanel.field && (
          <div style={{ height: '75vh' }}>
            <EditorPanel
              field={state.editorPanel.field}
              initialContent={state.editorPanel.initialContent || '<p></p>'}
              onConfirm={handleEditorConfirm}
              onDiscard={handleEditorDiscard}
            />
          </div>
        )}
      </BaseModal>
    </PageLayout>
  );
};
