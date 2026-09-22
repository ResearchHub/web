'use client';

import { useCallback, useRef, useState } from 'react';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import type { SelectedGrantDetails } from '@/types/grant';
import { cn } from '@/utils/styles';
import { useOptionalAIMode } from '../AIModeContext';
import { FundTeamLink, StartContextChips } from './StartContextChips';
import {
  START_COMPOSER_MIN_ROWS,
  startComposerBoxClass,
  startComposerPlaceholder,
  startComposerSendClass,
} from './startComposer';

interface StartConversationBoxProps {
  /** What the conversation is for; the page around the box decides. */
  readonly intent: FundingIntent;
  readonly className?: string;
}

/**
 * The workspace's start-screen composer, standing on its own on a page: the
 * same box, chips and colours, but no chat behind it. Sending hands the
 * message to the workspace, which opens on a new conversation and sends it.
 */
export function StartConversationBox({ intent, className }: StartConversationBoxProps) {
  const aiMode = useOptionalAIMode();
  const [draft, setDraft] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<SelectedGrantDetails | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(() => {
    const message = draft.trim();
    if (!message || !aiMode) return;
    aiMode.startConversation({
      intent,
      message,
      selectedGrant: intent === 'need_funding' ? selectedGrant : null,
    });
    setDraft('');
  }, [aiMode, draft, intent, selectedGrant]);

  if (!aiMode) return null;

  return (
    <div className={cn('flex flex-col', className)}>
      <ChatComposer
        textareaRef={textareaRef}
        value={draft}
        onChange={setDraft}
        onSend={send}
        onStop={() => {}}
        busy={false}
        canStop={false}
        disabled={false}
        notice={null}
        className="border-t-0 bg-transparent px-0 pb-0 pt-0"
        boxClassName={startComposerBoxClass(intent)}
        minRows={START_COMPOSER_MIN_ROWS}
        sendClassName={startComposerSendClass(intent)}
        placeholder={startComposerPlaceholder(intent)}
        toolbar={
          // A researcher's context rides with the first message, like attachments.
          intent === 'need_funding' ? (
            <StartContextChips selectedGrant={selectedGrant} onSelectGrant={setSelectedGrant} />
          ) : undefined
        }
      />
      {intent === 'fund' && (
        <div className="mt-1 flex min-h-11 items-center">
          <FundTeamLink />
        </div>
      )}
    </div>
  );
}
