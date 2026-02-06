'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import type { AssistantChatResponse } from '@/types/assistant';
import { AssistantService } from '@/services/assistant.service';
import { NoteService } from '@/services/note.service';
import { chatReducer, createInitialState } from './lib/assistantReducer';
import { ChatScreen } from './ChatScreen';
import { EditorPanel } from './EditorPanel';
import { AssistantProgress } from './AssistantProgress';
import { BaseModal } from '@/components/ui/BaseModal';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';

interface AssistantSessionProps {
  sessionId: string;
}

/* ------------------------------------------------------------------ */
/*  Process API responses                                              */
/* ------------------------------------------------------------------ */
function handleChatResponse(response: AssistantChatResponse, dispatch: React.Dispatch<any>) {
  if (response.session_id) {
    dispatch({ type: 'SET_SESSION_ID', sessionId: response.session_id });
  }

  if (response.note_id) {
    dispatch({ type: 'SET_NOTE_ID', noteId: String(response.note_id) });
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
    noteId: response.note_id ? String(response.note_id) : undefined,
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
/*  AssistantSession                                                   */
/* ================================================================== */
export const AssistantSession: React.FC<AssistantSessionProps> = ({ sessionId }) => {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const router = useRouter();
  const sessionIdRef = useRef(state.sessionId);
  sessionIdRef.current = state.sessionId;
  const hasInitialized = useRef(false);

  const role = state.role;
  const editorIsOpen = state.editorPanel.isOpen;

  // ── Load session on mount ─────────────────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadSession = async () => {
      try {
        // 1. Load session metadata
        const session = await AssistantService.getSession(sessionId);

        // 2. Hydrate state
        dispatch({
          type: 'HYDRATE_SESSION',
          sessionId: session.session_id,
          role: session.role,
          noteId: session.note_id,
          fieldState: session.field_state,
        });

        setIsLoadingSession(false);

        // 3. Resume the chat to get a welcome-back message
        const response = await AssistantService.chat({
          session_id: session.session_id,
          role: session.role,
          message: 'Resuming session',
        });

        handleChatResponse(response, dispatch);
      } catch {
        // Session not found or expired — redirect to onboarding
        router.replace('/assistant');
      }
    };

    loadSession();
  }, [sessionId, router]);

  // ── Send message ──────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, structuredInput?: { field: string; value: any }) => {
      dispatch({ type: 'ADD_USER_MESSAGE', content });
      dispatch({ type: 'SET_TYPING', isTyping: true });

      try {
        const response = await AssistantService.chat({
          session_id: sessionIdRef.current ?? sessionId,
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
    [role, sessionId]
  );

  // ── Submit ────────────────────────────────────────────────────────────
  // TODO: Wire to PostService.upsert / GrantService.createGrant
  // For now, placeholder that sends a message

  const handleSubmit = useCallback(async () => {
    dispatch({ type: 'SET_TYPING', isTyping: true });
    dispatch({
      type: 'ADD_BOT_MESSAGE',
      content: 'Submission flow coming soon! All fields have been collected.',
    });
  }, []);

  // ── Field click ───────────────────────────────────────────────────────

  const handleFieldClick = useCallback(
    (fieldKey: string) => {
      sendMessage(`Let's work on the ${fieldKey.replace(/_/g, ' ')} field`);
    },
    [sendMessage]
  );

  // ── Note creation ─────────────────────────────────────────────────────

  const createNoteForSession = useCallback(async () => {
    if (state.noteId) return state.noteId;

    // TODO: get orgSlug from user context
    const orgSlug = 'default';

    const note = await NoteService.createNote({
      title: state.fieldState.title?.value || 'Untitled',
      grouping: 'WORKSPACE' as any,
      organization_slug: orgSlug,
    });

    const template = role === 'funder' ? grantTemplate : proposalTemplate;
    await NoteService.updateNoteContent({
      note: note.id,
      full_json: JSON.stringify(template),
    });

    const noteId = String(note.id);
    dispatch({ type: 'SET_NOTE_ID', noteId });

    // Tell the backend about the note
    await AssistantService.chat({
      session_id: sessionIdRef.current ?? sessionId,
      message: 'Note created',
      structured_input: { field: 'note_id', value: noteId },
    });

    return noteId;
  }, [state.noteId, state.fieldState.title?.value, role, sessionId]);

  // ── Editor toggle ─────────────────────────────────────────────────────

  const handleToggleEditor = useCallback(async () => {
    if (editorIsOpen) {
      dispatch({ type: 'CLOSE_EDITOR' });
    } else {
      // Ensure a note exists before opening the editor
      await createNoteForSession();

      const existing = state.fieldState.description?.value;
      dispatch({
        type: 'OPEN_EDITOR',
        field: 'description',
        content: existing || '<p></p>',
      });
    }
  }, [editorIsOpen, state.fieldState.description?.value, createNoteForSession]);

  const handleEditorConfirm = useCallback(
    async (json: object, html: string) => {
      const field = state.editorPanel.field;
      if (!field) return;

      // Persist to note if one exists
      if (state.noteId) {
        await NoteService.updateNoteContent({
          note: state.noteId,
          full_json: JSON.stringify(json),
          full_src: html,
        });
      }

      sendMessage(`I've finished editing the ${field.replace(/_/g, ' ')}.`, {
        field,
        value: JSON.stringify(json),
      });
      dispatch({ type: 'CLOSE_EDITOR' });
    },
    [state.editorPanel.field, state.noteId, sendMessage]
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

  if (isLoadingSession) {
    return (
      <PageLayout rightSidebar={false}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-gray-500">Loading session...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!role) {
    router.replace('/assistant');
    return null;
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

      {/* Editor modal */}
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
