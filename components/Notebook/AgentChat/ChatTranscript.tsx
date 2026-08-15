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

/** Shared working state threaded through the transcript-building helpers. */
interface TranscriptBuild {
  entries: TranscriptEntry[];
  renderedMessages: Set<number>;
  renderedExecutions: Set<number>;
  answerByExecution: Map<number, ChatMessage>;
  executionsByTrigger: Map<number, ChatExecution[]>;
  executions: ChatExecution[];
}

/** First assistant answer per execution; retries keep the earliest. */
function indexAnswersByExecution(messages: ChatMessage[]): Map<number, ChatMessage> {
  const byExecution = new Map<number, ChatMessage>();
  for (const message of messages) {
    if (
      message.role === 'assistant' &&
      message.execution_id != null &&
      !byExecution.has(message.execution_id)
    ) {
      byExecution.set(message.execution_id, message);
    }
  }
  return byExecution;
}

function indexExecutionsByTrigger(executions: ChatExecution[]): Map<number, ChatExecution[]> {
  const byTrigger = new Map<number, ChatExecution[]>();
  for (const execution of executions) {
    if (execution.trigger_message_id != null) {
      const bucket = byTrigger.get(execution.trigger_message_id) ?? [];
      bucket.push(execution);
      byTrigger.set(execution.trigger_message_id, bucket);
    }
  }
  return byTrigger;
}

/**
 * A user bubble, then — retries can attach several executions to one user
 * message — each triggered execution's progress block in order, followed by
 * its answer when one exists.
 */
function pushUserEntries(build: TranscriptBuild, message: ChatMessage): void {
  build.entries.push({ key: `m-${message.id}`, kind: 'user', message });
  for (const execution of build.executionsByTrigger.get(message.id) ?? []) {
    build.renderedExecutions.add(execution.id);
    const answer = build.answerByExecution.get(execution.id) ?? null;
    if (answer) build.renderedMessages.add(answer.id);
    build.entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer });
  }
}

/**
 * An assistant message whose turn's trigger message isn't in the transcript
 * still shows the progress block alongside its answer; otherwise it renders as
 * a plain bubble.
 */
function pushAssistantEntry(build: TranscriptBuild, message: ChatMessage): void {
  const execution =
    message.execution_id != null
      ? build.executions.find((candidate) => candidate.id === message.execution_id)
      : undefined;
  if (execution && !build.renderedExecutions.has(execution.id)) {
    build.renderedExecutions.add(execution.id);
    build.entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer: message });
  } else {
    build.entries.push({ key: `m-${message.id}`, kind: 'assistant', message });
  }
}

/**
 * Order the transcript from the data rather than assumed pairings: chats can
 * hold messages with no executions, executions whose trigger message is
 * missing, and user messages whose turn failed. Everything present renders;
 * nothing double-renders.
 */
function buildTranscript(chat: NotebookChat, pendingSend: PendingSend | null): TranscriptEntry[] {
  const messages = [...chat.messages].sort((a, b) => a.sequence - b.sequence);
  const build: TranscriptBuild = {
    entries: [],
    renderedMessages: new Set<number>(),
    renderedExecutions: new Set<number>(),
    answerByExecution: indexAnswersByExecution(messages),
    executionsByTrigger: indexExecutionsByTrigger(chat.executions),
    executions: chat.executions, // ordered oldest → newest by the API
  };

  for (const message of messages) {
    if (build.renderedMessages.has(message.id)) continue;
    build.renderedMessages.add(message.id);
    if (message.role === 'user') {
      pushUserEntries(build, message);
    } else {
      pushAssistantEntry(build, message);
    }
  }

  // Executions whose trigger message never made it into `messages`.
  for (const execution of chat.executions) {
    if (!build.renderedExecutions.has(execution.id)) {
      build.entries.push({ key: `e-${execution.id}`, kind: 'execution', execution, answer: null });
    }
  }

  // Optimistic echo of a just-sent message until its execution shows up in a
  // refetch (the hook retires it at that point).
  const pendingExecutionId = pendingSend?.executionId ?? null;
  const echoRetired =
    pendingExecutionId != null &&
    chat.executions.some((execution) => execution.id === pendingExecutionId);
  if (pendingSend && !echoRetired) {
    build.entries.push({ key: 'pending-user', kind: 'pending-user', text: pendingSend.text });
  }

  return build.entries;
}

function UserBubble({ text }: { readonly text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gray-100 px-3.5 py-2 text-sm text-gray-800">
        {text}
      </div>
    </div>
  );
}

/**
 * Deliberately unbubbled: the assistant's prose reads as the page's own
 * content, which keeps long answers (the common case here) from sitting in a
 * boxed column. Only the user's turns are chrome-wrapped, so the transcript
 * still parses at a glance.
 */
function AssistantBubble({ content }: { readonly content: string }) {
  return (
    <div className="px-0.5">
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
    // Turns are separated by whitespace alone now that neither the assistant
    // answer nor its tool activity carries a card, so the gap between them has
    // to be larger than the gap within one turn.
    <div className="space-y-5">
      {entries.map((entry) => {
        switch (entry.kind) {
          case 'user':
            return <UserBubble key={entry.key} text={entry.message.content} />;
          case 'pending-user':
            return (
              <div key={entry.key} className="space-y-3">
                <UserBubble text={entry.text} />
                <LiveStatusLine label="Waiting to start" />
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
