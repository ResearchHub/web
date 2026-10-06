'use client';

import { useAIMode } from '../AIModeContext';
import type { AIModeChatState } from '../useAIModeChat';
import { ConversationsSection } from './ConversationsSection';
import { DraftsSection } from './DraftsSection';

interface WorkspaceSidebarProps {
  readonly state: AIModeChatState;
  /** The document that is open and its title as it stands, for the Drafts row to follow a rename. */
  readonly openNote?: { readonly id: number; readonly title: string } | null;
  /** Runs after any choice that should put a drawer away. */
  readonly onNavigate?: () => void;
}

/**
 * The workspace's lists, where the app's nav items normally are: pick up a
 * conversation of your own, or open a draft. Starting a new one is the
 * Publish button above them.
 */
export function WorkspaceSidebar({ state, openNote = null, onNavigate }: WorkspaceSidebarProps) {
  const { selectDocument } = useAIMode();
  const { target, chatId, list } = state;
  // The workspace does not admit this user: the reason stands alone, without
  // drafts that would open onto a chat they cannot use.
  const blocked = list.access === 'hidden';

  return (
    <div className="flex h-full flex-col">
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

        {!blocked && (
          <>
            <div aria-hidden="true" className="mx-2 mt-2.5 h-px bg-gray-200" />

            <DraftsSection
              activeNoteId={
                target.kind === 'document' && target.layout === 'document' ? target.noteId : null
              }
              recentNoteId={target.kind === 'conversation' ? (state.note?.id ?? null) : null}
              openNote={openNote}
              onSelect={(noteId) => {
                selectDocument(noteId);
                onNavigate?.();
              }}
            />
          </>
        )}
      </nav>
    </div>
  );
}
