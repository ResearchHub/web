'use client';

import { Plus } from 'lucide-react';
import { useAIMode } from '../AIModeContext';
import { cn } from '@/utils/styles';
import type { AIModeChatState } from '../useAIModeChat';
import { ConversationsSection } from './ConversationsSection';
import { DocumentsSection } from './DocumentsSection';

interface WorkspaceSidebarProps {
  readonly state: AIModeChatState;
  /** Runs after any choice that should put a drawer away. */
  readonly onNavigate?: () => void;
}

/** The left column: start a conversation, pick up one of your own, or open a document. */
export function WorkspaceSidebar({ state, onNavigate }: WorkspaceSidebarProps) {
  const { selectDocument } = useAIMode();
  const { target, chatId, list } = state;
  const onNewConversation = target.kind === 'conversation' && chatId == null;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => {
            state.startNewChat();
            onNavigate?.();
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50',
            onNewConversation && 'border-primary-200 bg-primary-50 hover:bg-primary-50'
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New conversation
        </button>
      </div>

      <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ConversationsSection
          chats={list.chats}
          access={list.access}
          accessDetail={list.accessDetail}
          activeChatId={chatId}
          titleFor={state.titleFor}
          onSelect={(item) => {
            state.selectConversation(item);
            onNavigate?.();
          }}
          onRename={state.rename}
          onDelete={state.deleteChat}
          loadNotes={state.notesForChat}
          onRetry={list.refresh}
        />

        <div aria-hidden="true" className="mx-2 mt-2.5 h-px bg-gray-200" />

        <DocumentsSection
          activeNoteId={target.kind === 'document' ? target.noteId : null}
          recentNoteId={target.kind === 'conversation' ? (state.note?.id ?? null) : null}
          onSelect={(noteId) => {
            selectDocument(noteId);
            onNavigate?.();
          }}
        />
      </nav>
    </div>
  );
}
