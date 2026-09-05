'use client';

import { motion } from 'framer-motion';
import { FileText, Link2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { BlockRenderer } from '../blocks/BlockRenderer';
import { useAIMode } from '../lib/AIModeContext';
import type { AIConversation, ChatMessage, QuickReply } from '../lib/types';
import { ActivityTrace } from './ActivityTrace';
import { AssistantActions, UserActions } from './MessageActions';
import { QuickReplies } from './QuickReplies';
import { ThinkingLine } from './ThinkingLine';

const ENTER = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

const messageText = (message: ChatMessage) =>
  message.blocks
    .filter((block) => block.kind === 'text')
    .map((block) => (block.kind === 'text' ? block.content : ''))
    .join('\n\n');

/** The assistant's mark. Breathes while the turn is still thinking. */
const AssistantOrb = ({ thinking }: { readonly thinking: boolean }) => (
  <div className="relative mt-1 h-7 w-7 shrink-0">
    {thinking && <span className="absolute inset-0 animate-ping rounded-full bg-primary-300/60" />}
    <div
      className={cn(
        'relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-sm',
        thinking && 'animate-pulse'
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  </div>
);

interface MessageProps {
  readonly message: ChatMessage;
  readonly conversation: AIConversation;
  /** Only the latest turn offers quick replies; older pills are dead weight. */
  readonly isLatest: boolean;
  readonly onQuickReply: (reply: QuickReply) => void;
  readonly quickRepliesDisabled: boolean;
}

const Message = ({
  message,
  conversation,
  isLatest,
  onQuickReply,
  quickRepliesDisabled,
}: MessageProps) => {
  const { actions, activeGrant, isBusy } = useAIMode();

  if (message.role === 'user') {
    return (
      <motion.div {...ENTER} className="group flex flex-col items-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gray-200/70 px-4 py-3 text-[17px] leading-[1.65] text-gray-900">
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {message.attachments.map((attachment) => (
                <span
                  key={attachment.id}
                  className="inline-flex max-w-[280px] items-center gap-1.5 rounded-lg border border-gray-300/70 bg-white/70 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {attachment.kind === 'link' ? (
                    <Link2 className="h-3 w-3 shrink-0 text-gray-400" />
                  ) : (
                    <FileText className="h-3 w-3 shrink-0 text-gray-400" />
                  )}
                  <span className="truncate">{attachment.name}</span>
                </span>
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap break-words">{messageText(message)}</div>
        </div>
        <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <UserActions
            text={messageText(message)}
            disabled={isBusy}
            onEdit={() => actions.editMessage(message.id)}
          />
        </div>
      </motion.div>
    );
  }

  const isThinking = message.status === 'thinking';
  const hasActivity = !!message.activity && message.activity.length > 0;

  // The block at `revealedBlocks` is the reveal frontier; everything past it
  // stays unmounted until the frontier moves.
  const visibleCount =
    message.status === 'complete' ? message.blocks.length : message.revealedBlocks + 1;

  return (
    <motion.div {...ENTER} className="group flex gap-3.5">
      <AssistantOrb thinking={isThinking} />

      <div className="min-w-0 flex-1 pt-0.5">
        {hasActivity && <ActivityTrace steps={message.activity ?? []} live={isThinking} />}

        {isThinking && !hasActivity && <ThinkingLine label={message.thinkingLabel ?? 'Thinking'} />}

        {!isThinking &&
          message.blocks.slice(0, visibleCount).map((block, index) => (
            // Blocks carry no outer margin of their own, so text after a card
            // gets the same breathing room as a card after text.
            <div key={index} className={cn(index > 0 && 'mt-5')}>
              <BlockRenderer
                block={block}
                animate={message.status === 'streaming' && index === message.revealedBlocks}
                onDone={() => actions.revealNextBlock(conversation.id, message.id)}
                grant={activeGrant}
                onCite={(citation) => actions.openDocument(citation.tab, citation.sectionId)}
              />
            </div>
          ))}

        {message.status === 'complete' && (
          <div
            className={cn(
              'mt-2.5 transition-opacity',
              isLatest
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            )}
          >
            <AssistantActions
              text={messageText(message)}
              feedback={message.feedback}
              canRegenerate={isLatest && !isBusy && !!message.stageId}
              onRegenerate={actions.regenerate}
              onFeedback={(feedback) => actions.setFeedback(message.id, feedback)}
            />
          </div>
        )}

        {message.status === 'complete' && isLatest && (
          <QuickReplies
            replies={message.quickReplies}
            disabled={quickRepliesDisabled}
            onSelect={onQuickReply}
          />
        )}
      </div>
    </motion.div>
  );
};

interface TranscriptProps {
  readonly conversation: AIConversation;
  readonly onQuickReply: (reply: QuickReply) => void;
  readonly quickRepliesDisabled: boolean;
}

export const Transcript = ({
  conversation,
  onQuickReply,
  quickRepliesDisabled,
}: TranscriptProps) => (
  <div className="space-y-8">
    {conversation.messages.map((message, index) => (
      <Message
        key={message.id}
        message={message}
        conversation={conversation}
        isLatest={index === conversation.messages.length - 1}
        onQuickReply={onQuickReply}
        quickRepliesDisabled={quickRepliesDisabled}
      />
    ))}
  </div>
);
