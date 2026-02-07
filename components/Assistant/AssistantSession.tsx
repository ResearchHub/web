'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import type { AssistantChatResponse } from '@/types/assistant';
import { AssistantService } from '@/services/assistant.service';
import { NoteService } from '@/services/note.service';
import { useCreateNoteFromTemplate } from '@/hooks/useNote';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { chatReducer, createInitialState } from './lib/assistantReducer';
import { ChatScreen } from './ChatScreen';
import { AssistantProgress } from './AssistantProgress';
import { AssistantNoteEditorModal } from './AssistantNoteEditorModal';
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
  const { selectedOrg } = useOrganizationContext();
  const [, createNoteFromTemplate] = useCreateNoteFromTemplate();
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
        const session = await AssistantService.getSession(sessionId);

        dispatch({
          type: 'HYDRATE_SESSION',
          sessionId: session.session_id,
          role: session.role,
          noteId: session.note_id,
          fieldState: session.field_state,
        });

        setIsLoadingSession(false);

        // Determine if this is a new session or a returning one
        const hasProgress = Object.values(session.field_state).some(
          (f: any) => f.status !== 'empty'
        );

        const response = await AssistantService.chat({
          session_id: session.session_id,
          role: session.role,
          action: hasProgress ? 'resume' : 'start',
        });

        handleChatResponse(response, dispatch);
      } catch {
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
          action: 'message',
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
    if (state.noteId) return { noteId: state.noteId, contentJson: '' };

    if (!selectedOrg?.slug) {
      throw new Error('No organization selected');
    }

    const template = role === 'funder' ? grantTemplate : proposalTemplate;

    const fullNote = await createNoteFromTemplate({
      organizationSlug: selectedOrg.slug,
      template,
      title: state.fieldState.title?.value,
    });

    const noteId = String(fullNote.id);
    dispatch({ type: 'SET_NOTE_ID', noteId });

    await AssistantService.chat({
      session_id: sessionIdRef.current ?? sessionId,
      action: 'message',
      message: 'Note created',
      structured_input: { field: 'note_id', value: noteId },
    });

    return { noteId, contentJson: fullNote.contentJson || '' };
  }, [
    state.noteId,
    state.fieldState.title?.value,
    role,
    sessionId,
    selectedOrg?.slug,
    createNoteFromTemplate,
  ]);

  // ── Editor toggle ─────────────────────────────────────────────────────

  const handleToggleEditor = useCallback(async () => {
    if (editorIsOpen) {
      dispatch({ type: 'CLOSE_EDITOR' });
    } else {
      const { noteId, contentJson } = await createNoteForSession();

      let noteContent: string | undefined;
      let noteContentJson = contentJson || undefined;

      if (!noteContentJson && noteId) {
        try {
          const noteData = await NoteService.getNote(noteId);
          noteContent = noteData.content || undefined;
          noteContentJson = noteData.contentJson || undefined;
        } catch {
          // Fall back to empty
        }
      }

      dispatch({
        type: 'OPEN_EDITOR',
        field: 'description',
        content: noteContent,
        contentJson: noteContentJson,
      });
    }
  }, [editorIsOpen, createNoteForSession]);

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
