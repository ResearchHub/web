'use client';

import { useEffect, useRef } from 'react';
import { Bell, Building2, FileText, Megaphone, PenLine, Scale } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';
import { Composer, type SlashCommand } from '../chat/Composer';
import { HomeState } from '../chat/HomeState';
import { Transcript } from '../chat/Transcript';
import { useAIMode } from '../lib/AIModeContext';
import { RFP_SECTIONS } from '../lib/grantData';
import type { QuickReply } from '../lib/types';

export const ChatPanel = () => {
  const { activeConversation, activeGrant, isBusy, composerDraft, actions } = useAIMode();
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

  const commands: SlashCommand[] = [
    ...(activeGrant
      ? [
          {
            id: 'show-rfp',
            label: 'Show the RFP',
            description: 'Open the document panel',
            icon: FileText,
            run: () => actions.openDocument('rfp'),
          },
          {
            id: 'show-judgment',
            label: 'Show judgment rules',
            description: 'How funds are allocated',
            icon: Scale,
            run: () => actions.openDocument('judgment', 'policy'),
          },
          {
            id: 'show-org',
            label: 'Show About',
            description: 'Who is funding this',
            icon: Building2,
            run: () => actions.openDocument('org'),
          },
        ]
      : []),
    {
      id: 'rfp',
      label: 'Open an RFP',
      description: 'Draft and fund a call for proposals',
      icon: Megaphone,
      run: () => actions.startTrack('rfp'),
    },
    {
      id: 'proposal',
      label: 'Draft a proposal',
      description: 'Write a preregistration',
      icon: PenLine,
      run: () => actions.startTrack('proposal'),
    },
    {
      id: 'updates',
      label: 'Get updates',
      description: 'Check on funded work',
      icon: Bell,
      run: () => actions.startTrack('updates'),
    },
  ];

  const isPanelOpen = !!activeConversation?.panel.open;
  const draftedCount = activeGrant?.rfp.revealedSections.length ?? 0;
  const isDrafting = !!activeGrant && draftedCount > 0 && draftedCount < RFP_SECTIONS.length;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
          {activeConversation?.title ?? 'New conversation'}
        </div>

        {activeGrant && !isPanelOpen && (
          <button
            type="button"
            onClick={() => actions.setPanel(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-3 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <span className="flex items-center -space-x-1">
              {[FileText, Scale, Building2].map((Icon, index) => (
                <span
                  key={index}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white"
                >
                  <Icon className="h-3 w-3 text-gray-600" />
                </span>
              ))}
            </span>
            Documents
            {isDrafting && (
              <span className="text-gray-400">
                {draftedCount}/{RFP_SECTIONS.length}
              </span>
            )}
            {activeGrant.rfp.status === 'published' && (
              <span className="rounded bg-emerald-100 px-1 py-px text-[10px] font-semibold text-emerald-700">
                Live
              </span>
            )}
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
            <div className={cn('mx-auto w-full', 'max-w-[760px]')}>
              <Transcript
                conversation={activeConversation}
                onQuickReply={handleQuickReply}
                quickRepliesDisabled={isBusy}
              />
            </div>
          </div>

          <div className="px-5 pb-3 pt-1">
            <div className="mx-auto w-full max-w-[760px]">
              <Composer
                disabled={isBusy}
                isGenerating={isBusy}
                onStop={actions.stopGeneration}
                onSend={(value, attachments) => actions.sendMessage(value, { attachments })}
                placeholder={
                  isBusy ? 'Thinking…' : 'Reply, pick a suggestion, or type / for commands…'
                }
                draft={composerDraft}
                onDraftConsumed={actions.clearComposerDraft}
                commands={commands}
              />
              <div className="mt-2 text-center text-[11px] text-gray-400">
                AI Mode can make mistakes. Every dollar it moves is traceable to a peer review.
              </div>
            </div>
          </div>
        </>
      ) : (
        <HomeState firstName={user?.firstName} />
      )}
    </div>
  );
};
