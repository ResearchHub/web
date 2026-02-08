'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import type { AssistantChatResponse } from '@/types/assistant';
import { AssistantService } from '@/services/assistant.service';
import { NoteService } from '@/services/note.service';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { chatReducer, createInitialState } from './lib/assistantReducer';
import { ChatScreen } from './ChatScreen';
import { AssistantProgress } from './AssistantProgress';
import { AssistantNoteEditorModal } from './AssistantNoteEditorModal';

interface AssistantSessionProps {
  sessionId: string;
}

/* ------------------------------------------------------------------ */
/*  Process API responses (pure state updates only)                    */
/* ------------------------------------------------------------------ */
function dispatchChatResponse(response: AssistantChatResponse, dispatch: React.Dispatch<any>) {
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
  const { selectedOrg } = useOrganizationContext();
  const sessionIdRef = useRef(state.sessionId);
  sessionIdRef.current = state.sessionId;
  const noteIdRef = useRef(state.noteId);
  noteIdRef.current = state.noteId;
  const hasInitialized = useRef(false);

  const role = state.role;
  const editorIsOpen = state.editorPanel.isOpen;

  // ── Note creation (empty, no template) ────────────────────────────────

  const ensureNoteExists = useCallback(async (): Promise<string> => {
    if (noteIdRef.current) return noteIdRef.current;

    if (!selectedOrg?.slug) {
      throw new Error('No organization selected');
    }

    const note = await NoteService.createNote({
      title: state.fieldState.title?.value || 'Untitled',
      grouping: 'WORKSPACE' as any,
      organization_slug: selectedOrg.slug,
    });

    const noteId = String(note.id);
    dispatch({ type: 'SET_NOTE_ID', noteId });
    noteIdRef.current = noteId;

    // Tell the backend about the note
    await AssistantService.chat({
      session_id: sessionIdRef.current ?? sessionId,
      action: 'message',
      message: 'Note created',
      structured_input: { field: 'note_id', value: noteId },
    });

    return noteId;
  }, [state.fieldState.title?.value, sessionId, selectedOrg?.slug]);

  // ── Process API response + create note if needed ──────────────────────

  const handleChatResponse = useCallback(
    async (response: AssistantChatResponse) => {
      // Dispatch all state updates
      dispatchChatResponse(response, dispatch);

      // If the API sent rich_editor content and no note exists yet, create one
      if (
        response.input_type === 'rich_editor' &&
        response.follow_up &&
        !noteIdRef.current &&
        !response.note_id
      ) {
        await ensureNoteExists();
      }
    },
    [ensureNoteExists]
  );

  // ── Load session on mount ─────────────────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadSession = async () => {
      try {
        const session = await AssistantService.getSession(sessionId);

        dispatch({
          type: 'HYDRATE_SESSION',
          sessionId: session.session_id,
          role: session.role,
          noteId: session.note_id,
          fieldState: session.field_state,
        });

        if (session.note_id) {
          noteIdRef.current = session.note_id;
        }

        setIsLoadingSession(false);

        const hasProgress = Object.values(session.field_state).some(
          (f: any) => f.status !== 'empty'
        );

        const response = await AssistantService.chat({
          session_id: session.session_id,
          role: session.role,
          action: hasProgress ? 'resume' : 'start',
        });

        await handleChatResponse(response);
      } catch {
        router.replace('/assistant');
      }
    };

    loadSession();
  }, [sessionId, router, handleChatResponse]);

  // ── Send message ──────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, structuredInput?: { field: string; value: any }) => {
      dispatch({ type: 'ADD_USER_MESSAGE', content });
      dispatch({ type: 'SET_TYPING', isTyping: true });

      try {
        const response = await AssistantService.chat({
          session_id: sessionIdRef.current ?? sessionId,
          role: role ?? undefined,
          action: 'message',
          message: content,
          structured_input: structuredInput,
        });
        await handleChatResponse(response);
      } catch {
        dispatch({
          type: 'ADD_BOT_MESSAGE',
          content: 'Sorry, I hit a snag. Could you try again?',
        });
      }
    },
    [role, sessionId, handleChatResponse]
  );

  // ── Submit ────────────────────────────────────────────────────────────
  // TODO: Wire to PostService.upsert / GrantService.createGrant

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

  // ── Editor toggle ─────────────────────────────────────────────────────

  const handleToggleEditor = useCallback(async () => {
    if (editorIsOpen) {
      dispatch({ type: 'CLOSE_EDITOR' });
    } else {
      await ensureNoteExists();

      dispatch({
        type: 'OPEN_EDITOR',
        field: 'description',
        content: state.editorPanel.content || '<p></p>',
        contentJson: state.editorPanel.contentJson || undefined,
      });
    }
  }, [editorIsOpen, ensureNoteExists, state.editorPanel.content, state.editorPanel.contentJson]);

  // ── Editor confirm: save to note only, no sendMessage ─────────────────

  const handleEditorConfirm = useCallback(
    async (json: object, html: string) => {
      if (!state.editorPanel.field) return;

      if (noteIdRef.current) {
        await NoteService.updateNoteContent({
          note: noteIdRef.current,
          full_json: JSON.stringify(json),
          full_src: html,
        });
      }

      dispatch({ type: 'CLOSE_EDITOR' });
    },
    [state.editorPanel.field]
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
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
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

      {editorIsOpen && state.editorPanel.field && (
        <AssistantNoteEditorModal
          isOpen
          content={state.editorPanel.content || undefined}
          contentJson={state.editorPanel.contentJson || undefined}
          onConfirm={handleEditorConfirm}
          onDiscard={handleEditorDiscard}
        />
      )}
    </PageLayout>
  );
};
