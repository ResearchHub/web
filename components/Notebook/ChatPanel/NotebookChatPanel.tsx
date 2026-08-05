'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import type { UseNotebookChatActions, UseNotebookChatState } from '@/hooks/useNotebookChat';
import { activitySources, type NotebookChatExecution } from '@/types/notebookChat';
import { ChatActivityTrail } from './ChatActivityTrail';
import { ChatComposer } from './ChatComposer';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatSources } from './ChatSources';

interface NotebookChatPanelProps {
  chat: UseNotebookChatState;
  actions: UseNotebookChatActions;
  onClose: () => void;
  className?: string;
}

function BouncingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * What the agent is doing right now. Tool steps arrive on the poll, so they
 * only appear once the turn has run one — until then there is nothing to say
 * beyond that it is thinking.
 */
function WorkingIndicator({ execution }: { execution: NotebookChatExecution | null }) {
  const events = execution?.activity ?? [];
  return (
    <div className="flex w-full justify-start">
      {events.length > 0 ? <ChatActivityTrail events={events} isRunning /> : <BouncingDots />}
    </div>
  );
}

/**
 * An assistant reply with the work behind it: the tool steps that produced it
 * above, and everything they cited below.
 */
function AssistantTurn({
  content,
  execution,
}: {
  content: string;
  execution: NotebookChatExecution | null;
}) {
  const sources = execution ? activitySources(execution) : [];
  return (
    <div className="flex flex-col gap-1.5">
      {execution && <ChatActivityTrail events={execution.activity} />}
      <ChatMessageItem role="assistant" content={content} />
      <ChatSources sources={sources} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Sparkles className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Research assistant</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Ask questions about this note, research related literature, or request edits — changes are
          applied directly to the note.
        </p>
      </div>
    </div>
  );
}

/**
 * The notebook assistant chat: message history, a working indicator while a
 * turn runs, and a composer. Purely presentational — state comes from
 * `useNotebookChat` so a running turn keeps polling even when the panel is
 * closed.
 */
export function NotebookChatPanel({ chat, actions, onClose, className }: NotebookChatPanelProps) {
  const {
    conversation,
    isLoading,
    loadError,
    isSending,
    sendError,
    pendingMessage,
    isAssistantWorking,
    turnError,
    latestExecution,
    executionsById,
  } = chat;

  const messages = conversation?.messages ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows — including
  // while a running turn adds tool steps, which grow the trail with no new
  // message to trigger this.
  const activityCount = latestExecution?.activity.length ?? 0;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, pendingMessage, isAssistantWorking, turnError, activityCount]);

  const showEmptyState =
    !isLoading && !loadError && messages.length === 0 && !pendingMessage && !isAssistantWorking;

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-gray-900">Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Close assistant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader size="sm" />
          </div>
        )}
        {!isLoading && loadError && (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-xs text-red-500">{loadError}</p>
          </div>
        )}
        {showEmptyState && <EmptyState />}
        {!isLoading && !loadError && (
          <div className="flex flex-col gap-3">
            {messages.map((message) =>
              message.role === 'assistant' ? (
                <AssistantTurn
                  key={message.id}
                  content={message.content}
                  execution={
                    message.executionId != null
                      ? (executionsById.get(message.executionId) ?? null)
                      : null
                  }
                />
              ) : (
                <ChatMessageItem key={message.id} role="user" content={message.content} />
              )
            )}
            {pendingMessage && <ChatMessageItem role="user" content={pendingMessage} isPending />}
            {isAssistantWorking && <WorkingIndicator execution={latestExecution} />}
            {turnError && (
              <div className="flex flex-col gap-1.5">
                {/* The turn left no reply, so its steps are the only record of
                    how far it got before it died. */}
                {latestExecution && <ChatActivityTrail events={latestExecution.activity} />}
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{turnError} You can send another message to try again.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatComposer
        disabled={isSending || isAssistantWorking}
        error={sendError}
        onClearError={actions.clearSendError}
        onSend={actions.sendMessage}
      />
    </div>
  );
}
