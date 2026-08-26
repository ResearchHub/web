'use client';

import { Plus } from 'lucide-react';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';

export const ConversationSidebar = () => {
  const { conversations, activeConversation, actions } = useAIMode();

  return (
    <div className="flex h-full w-[264px] shrink-0 flex-col border-r border-gray-200">
      <div className="px-3 py-3">
        <button
          type="button"
          onClick={actions.newConversation}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 && (
          <p className="px-3 py-2 text-xs text-gray-400">No conversations yet.</p>
        )}

        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversation?.id;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => actions.selectConversation(conversation.id)}
              className={cn(
                'mb-1 w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                isActive ? 'bg-white shadow-sm' : 'hover:bg-gray-100'
              )}
            >
              <div className="truncate text-sm font-medium text-gray-900">{conversation.title}</div>
              <div className="mt-0.5 truncate text-xs text-gray-500">{conversation.subtitle}</div>
              <div className="mt-1 text-[11px] text-gray-400">
                {formatTimeAgo(new Date(conversation.updatedAt).toISOString())}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
