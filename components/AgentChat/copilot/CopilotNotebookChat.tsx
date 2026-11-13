'use client';

import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CopilotKitProvider,
  useAgent,
  useRenderActivityMessage,
  useRenderToolCall,
} from '@copilotkit/react-core/v2';
import type { ActivityMessage, Message, ToolMessage } from '@ag-ui/core';
import { ActivityFeed } from '@/components/AgentChat/ActivityFeed';
import { MessageAttachments } from '@/components/AgentChat/ChatAttachments';
import { MarkdownMessage } from '@/components/AgentChat/MarkdownMessage';
import { Button } from '@/components/ui/Button';
import { NOTEBOOK_CHAT_AGENT_ID, notebookChatAgent } from '@/services/notebookChatAgent';
import type { ChatStreamItem } from '@/types/agentChat';
import type { AgentFile } from '@/types/agentFile';
import { ACTIVITY_RENDERERS, TOOL_CALL_RENDERERS, isPreviewId } from './renderers';

/**
 * Where the host can add to a turn: under a published answer (by the chat
 * message's id), or under a turn's status line (running, failed, stopped, or
 * answered by another model).
 */
export type TranscriptAnchor =
  | { readonly kind: 'answer'; readonly chatMessageId: number }
  | { readonly kind: 'status'; readonly executionId: number };

interface CopilotNotebookChatProps {
  readonly noteId: string;
  readonly chatId: number;
  /** What goes under an anchor, such as the document a turn wrote to. */
  readonly renderAfter?: (anchor: TranscriptAnchor) => ReactNode;
}

/**
 * A workspace document chat's transcript (the backend's notebook chat),
 * streamed over AG-UI and rendered through CopilotKit: messages come from the
 * chat's agent, tool calls from the registered tool renderers, and a turn's
 * status line from the activity renderer. Opening a chat loads its history and rejoins a running turn;
 * leaving it only stops watching.
 */
export function CopilotNotebookChat({ noteId, chatId, renderAfter }: CopilotNotebookChatProps) {
  const agent = useMemo(() => notebookChatAgent(noteId, chatId), [noteId, chatId]);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    let current = true;
    setLoadFailed(false);
    void agent.load().then((error) => {
      if (current) setLoadFailed(error !== null);
    });
    return () => {
      current = false;
      agent.detach();
    };
  }, [agent]);
  const retry = useCallback(() => {
    setLoadFailed(false);
    void agent.reload().then((error) => setLoadFailed(error !== null));
  }, [agent]);
  const agents = useMemo(() => ({ [NOTEBOOK_CHAT_AGENT_ID]: agent }), [agent]);

  return (
    <CopilotKitProvider
      agentId={NOTEBOOK_CHAT_AGENT_ID}
      selfManagedAgents={agents}
      renderToolCalls={TOOL_CALL_RENDERERS}
      renderActivityMessages={ACTIVITY_RENDERERS}
      enableInspector={false}
      showIntelligenceIndicator={false}
      // Turn failures are part of the transcript (the status line); the run
      // erroring as well needs no second report.
      onError={() => undefined}
    >
      <Transcript renderAfter={renderAfter} />
      {loadFailed && (
        <div className="flex flex-col items-center gap-3 px-6 py-4 text-center">
          <p className="text-sm text-gray-600">Couldn’t load this chat.</p>
          <Button variant="outlined" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
    </CopilotKitProvider>
  );
}

function Transcript({
  renderAfter,
}: {
  readonly renderAfter?: (anchor: TranscriptAnchor) => ReactNode;
}) {
  const { agent } = useAgent({ agentId: NOTEBOOK_CHAT_AGENT_ID });
  const renderToolCall = useRenderToolCall();
  const { renderActivityMessage } = useRenderActivityMessage();
  const messages = agent.messages;
  const running = agent.isRunning;

  const toolResults = useMemo(() => {
    const results = new Map<string, ToolMessage>();
    for (const message of messages) {
      if (message.role === 'tool') results.set(message.toolCallId, message);
    }
    return results;
  }, [messages]);

  const lastId = messages.at(-1)?.id;

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const anchor = renderAfter ? anchorOf(message) : null;
        return (
          <Fragment key={message.id}>
            {renderMessage(message, {
              streaming: running && message.id === lastId && isPreviewId(message.id),
              renderToolCall: (toolCall) =>
                renderToolCall({ toolCall, toolMessage: toolResults.get(toolCall.id) }),
              renderActivity: (activity) => renderActivityMessage(activity),
            })}
            {anchor && renderAfter?.(anchor)}
          </Fragment>
        );
      })}
    </div>
  );
}

/** The anchor a message is, if hosts can add under it. */
function anchorOf(message: Message): TranscriptAnchor | null {
  if (message.role === 'assistant') {
    const answer = /^msg-(\d+)$/.exec(message.id);
    return answer ? { kind: 'answer', chatMessageId: Number(answer[1]) } : null;
  }
  if (message.role === 'activity') {
    const executionId = (message.content as { execution_id?: unknown }).execution_id;
    return typeof executionId === 'number' ? { kind: 'status', executionId } : null;
  }
  return null;
}

interface RenderContext {
  /** This message is the preview the model is writing right now. */
  readonly streaming: boolean;
  readonly renderToolCall: (
    toolCall: NonNullable<Extract<Message, { role: 'assistant' }>['toolCalls']>[number]
  ) => ReactNode;
  readonly renderActivity: (message: ActivityMessage) => ReactNode;
}

function renderMessage(message: Message, context: RenderContext): ReactNode {
  switch (message.role) {
    case 'user':
      return (
        <UserBubble
          text={typeof message.content === 'string' ? message.content : ''}
          attachments={
            ((message.metadata as { attachments?: AgentFile[] } | undefined)?.attachments ??
              []) as AgentFile[]
          }
        />
      );
    case 'assistant': {
      const isAnswer = message.id.startsWith('msg-');
      return (
        <>
          {message.content &&
            (isAnswer ? (
              <div className="px-0.5">
                <MarkdownMessage content={message.content} />
              </div>
            ) : (
              <ActivityFeed items={[{ type: 'narration', text: message.content, at: '' }]} />
            ))}
          {message.toolCalls?.map((toolCall) => (
            <Fragment key={toolCall.id}>{context.renderToolCall(toolCall)}</Fragment>
          ))}
        </>
      );
    }
    case 'reasoning': {
      const thinking: ChatStreamItem = {
        id: message.id,
        type: 'thinking',
        text: message.content,
        at: '',
      };
      return (
        <ActivityFeed
          items={[thinking]}
          streamingItemId={context.streaming ? message.id : undefined}
        />
      );
    }
    case 'activity':
      return context.renderActivity(message);
    default:
      return null;
  }
}

function UserBubble({
  text,
  attachments,
}: {
  readonly text: string;
  readonly attachments: AgentFile[];
}) {
  return (
    <div className="space-y-1.5">
      <MessageAttachments files={attachments} />
      {text && (
        <div className="flex justify-end">
          <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gray-100 px-3.5 py-2 text-md text-gray-800">
            {text}
          </div>
        </div>
      )}
    </div>
  );
}
