'use client';

import { BlockRenderer } from '../blocks/BlockRenderer';
import { useAIMode } from '../lib/AIModeContext';
import type { AIConversation, ChatMessage, QuickReply } from '../lib/types';
import { QuickReplies } from './QuickReplies';
import { ThinkingLine } from './ThinkingLine';

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
  const { actions } = useAIMode();

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gray-200/70 px-4 py-3 text-[17px] leading-[1.65] text-gray-900">
          {message.blocks.map((block, index) =>
            block.kind === 'text' ? <span key={index}>{block.content}</span> : null
          )}
        </div>
      </div>
    );
  }

  if (message.status === 'thinking') {
    return <ThinkingLine label={message.thinkingLabel ?? 'Thinking'} />;
  }

  // The block at `revealedBlocks` is the reveal frontier; everything past it
  // stays unmounted until the frontier moves.
  const visibleCount =
    message.status === 'complete' ? message.blocks.length : message.revealedBlocks + 1;

  return (
    <div className="min-w-0">
      {message.blocks.slice(0, visibleCount).map((block, index) => (
        <BlockRenderer
          key={index}
          block={block}
          animate={message.status === 'streaming' && index === message.revealedBlocks}
          onDone={() => actions.revealNextBlock(conversation.id, message.id)}
          conversation={conversation}
        />
      ))}

      {message.status === 'complete' && isLatest && (
        <QuickReplies
          replies={message.quickReplies}
          disabled={quickRepliesDisabled}
          onSelect={onQuickReply}
        />
      )}
    </div>
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
