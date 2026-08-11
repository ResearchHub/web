'use client';

import { useMemo } from 'react';
import type { ChatExecution, ChatMessage, NotebookChat } from '@/types/notebookChat';
import type { PendingSend } from '@/hooks/useNotebookChat';
import { MarkdownMessage } from './MarkdownMessage';
import { ExecutionProgress, LiveStatusLine } from './ExecutionProgress';

type TranscriptEntry =
  | { key: string; kind: 'user'; message: ChatMessage }
  | { key: string; kind: 'execution'; execution: ChatExecution; answer: ChatMessage | null }
  | { key: string; kind: 'assistant'; message: ChatMessage }
  | { key: string; kind: 'pending-user'; text: string };

/**
 * Order the transcript from the data rather than assumed pairings: chats can
 * hold messages with no executions, executions whose trigger message is
 * missing, and user messages whose turn failed. Everything present renders;
 * nothing double-renders.
 */
function buildTranscript(chat: NotebookChat, pendingSend: PendingSend | null): TranscriptEntry[] {
  const messages = [...chat.messages].sort((a, b) => a.sequence - b.sequence);
  const executions = chat.executions; // ordered oldest → newest by the API

  const answerByExecution = new Map<number, ChatMessage>();
  for (const message of messages) {
    if (
      message.role === 'assistant' &&
      message.execution_id != null &&
      !answerByExecution.has(message.execution_id)
    ) {
      answerByExecution.set(message.execution_id, message);
    }
  }

  const executionsByTrigger = new Map<number, ChatExecution[]>();
  for (const execution of executions) {
    if (execution.trigger_message_id != null) {
      const bucket = executionsByTrigger.get(execution.trigger_message_id) ?? [];
      bucket.push(execution);
      executionsByTrigger.set(execution.trigger_message_id, bucket);
    }
  }

  const renderedMessages = new Set<number>();
  const renderedExecutions = new Set<number>();
  const entries: TranscriptEntry[] = [];

  for (const message of messages) {
    if (renderedMessages.has(message.id)) continue;
    renderedMessages.add(message.id);

    if (message.role === 'user') {
      entries.push({ key: `m-${message.id}`, kind: 'user', message });
      // Retries can attach several executions to one user message; render each
      // progress block in order, followed by its answer when one exists.
      for (const execution of executionsByTrigger.get(message.id) ?? []) {
        renderedExecutions.add(execution.id);
        const answer = answerByExecution.get(execution.id) ?? null;
        if (answer) renderedMessages.add(answer.id);
        entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer });
      }
    } else {
      const execution =
        message.execution_id != null
          ? executions.find((candidate) => candidate.id === message.execution_id)
          : undefined;
      if (execution && !renderedExecutions.has(execution.id)) {
        // The turn's trigger message isn't in the transcript — still show the
        // progress block alongside its answer.
        renderedExecutions.add(execution.id);
        entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer: message });
      } else {
        entries.push({ key: `m-${message.id}`, kind: 'assistant', message });
      }
    }
  }

  for (const execution of executions) {
    if (!renderedExecutions.has(execution.id)) {
      entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer: null });
    }
  }

  // Optimistic echo of a just-sent message until its execution shows up in a
  // refetch (the hook retires it at that point).
  if (
    pendingSend &&
    (pendingSend.executionId == null ||
      !executions.some((execution) => execution.id === pendingSend.executionId))
  ) {
    entries.push({ key: 'pending-user', kind: 'pending-user', text: pendingSend.text });
  }

  return entries;
}

function UserBubble({ text }: { readonly text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary-500 px-3.5 py-2 text-sm text-white">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { readonly content: string }) {
  return (
    <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
      <MarkdownMessage content={content} />
    </div>
  );
}

interface ChatTranscriptProps {
  readonly chat: NotebookChat;
  readonly pendingSend: PendingSend | null;
}

export function ChatTranscript({ chat, pendingSend }: ChatTranscriptProps) {
  const entries = useMemo(() => buildTranscript(chat, pendingSend), [chat, pendingSend]);

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        switch (entry.kind) {
          case 'user':
            return <UserBubble key={entry.key} text={entry.message.content} />;
          case 'pending-user':
            return (
              <div key={entry.key} className="space-y-3">
                <UserBubble text={entry.text} />
                <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <LiveStatusLine label="Waiting to start" />
                </div>
              </div>
            );
          case 'execution':
            return (
              <div key={entry.key} className="space-y-3">
                <ExecutionProgress execution={entry.execution} />
                {entry.answer && <AssistantBubble content={entry.answer.content} />}
              </div>
            );
          case 'assistant':
            return <AssistantBubble key={entry.key} content={entry.message.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
