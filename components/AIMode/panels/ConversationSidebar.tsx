'use client';

import { FileText, Plus } from 'lucide-react';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';
import { RFP_SECTIONS } from '../lib/grantData';
import type { GrantRecord } from '../lib/types';

/** The RFP's state in one word, for the row under a conversation title. */
const rfpIndicator = (grant: GrantRecord | undefined) => {
  if (!grant) return null;
  if (grant.rfp.status === 'published') {
    return { label: 'Live', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
  }
  const drafted = grant.rfp.revealedSections.length;
  if (drafted === 0) return null;
  if (drafted < RFP_SECTIONS.length) {
    return {
      label: `Drafting ${drafted}/${RFP_SECTIONS.length}`,
      className: 'bg-primary-50 text-primary-700 ring-primary-200',
    };
  }
  return { label: 'Drafted', className: 'bg-gray-100 text-gray-600 ring-gray-200' };
};

export const ConversationSidebar = () => {
  const { conversations, grants, activeConversation, actions } = useAIMode();

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
          const indicator = rfpIndicator(grants.find((grant) => grant.id === conversation.grantId));

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
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">
                  {formatTimeAgo(new Date(conversation.updatedAt).toISOString())}
                </span>
                {indicator && (
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold ring-1',
                      indicator.className
                    )}
                  >
                    <FileText className="h-2.5 w-2.5" />
                    RFP · {indicator.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
