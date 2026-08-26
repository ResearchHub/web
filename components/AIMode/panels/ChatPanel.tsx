'use client';

import { useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';
import { Composer } from '../chat/Composer';
import { HomeState } from '../chat/HomeState';
import { Transcript } from '../chat/Transcript';
import { useAIMode } from '../lib/AIModeContext';
import { RFP_SECTIONS } from '../lib/grantData';
import type { QuickReply } from '../lib/types';

export const ChatPanel = () => {
  const { activeConversation, isBusy, actions } = useAIMode();
  const { user } = useUser();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const messageCount = activeConversation?.messages.length ?? 0;
  const lastMessage = activeConversation?.messages.at(-1);

  useEffect(() => {
    isNearBottomRef.current = true;
  }, [activeConversation?.id]);

  // Follow the transcript while the funder is at the bottom, but never yank the
  // view back down if he has scrolled up to re-read something.
  useEffect(() => {
    const element = scrollRef.current;
    if (element && isNearBottomRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messageCount, lastMessage?.status, lastMessage?.revealedBlocks]);

  const handleQuickReply = (reply: QuickReply) => {
    actions.sendMessage(reply.label, reply.goTo ? { goTo: reply.goTo } : undefined);
  };

  const hasDocumentContent = (activeConversation?.revealedSections.length ?? 0) > 0;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
          {activeConversation?.title ?? 'New conversation'}
        </div>

        {hasDocumentContent && !activeConversation?.documentOpen && (
          <button
            type="button"
            onClick={() => actions.setDocumentOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FileText className="h-3.5 w-3.5" />
            RFP draft
            <span className="text-gray-400">
              {activeConversation?.revealedSections.length}/{RFP_SECTIONS.length}
            </span>
          </button>
        )}
      </div>

      {activeConversation ? (
        <>
          <div
            ref={scrollRef}
            onScroll={(event) => {
              const element = event.currentTarget;
              isNearBottomRef.current =
                element.scrollHeight - element.scrollTop - element.clientHeight < 90;
            }}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          >
            <div className={cn('mx-auto w-full', 'max-w-[720px]')}>
              <Transcript
                conversation={activeConversation}
                onQuickReply={handleQuickReply}
                quickRepliesDisabled={isBusy}
              />
            </div>
          </div>

          <div className="px-5 pb-5 pt-1">
            <div className="mx-auto w-full max-w-[720px]">
              <Composer
                disabled={isBusy}
                onSend={(value) => actions.sendMessage(value)}
                placeholder={isBusy ? 'Thinking…' : 'Reply, or pick a suggestion above…'}
              />
            </div>
          </div>
        </>
      ) : (
        <HomeState firstName={user?.firstName} />
      )}
    </div>
  );
};
