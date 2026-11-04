'use client';

import { Fragment, useEffect, useMemo, type ReactNode } from 'react';
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
import { NOTEBOOK_CHAT_AGENT_ID, notebookChatAgent } from '@/services/notebookChatAgent';
import type { ChatStreamItem } from '@/types/agentChat';
import type { AgentFile } from '@/types/agentFile';
import { ACTIVITY_RENDERERS, TOOL_CALL_RENDERERS, isPreviewId } from './renderers';

interface CopilotNotebookChatProps {
  readonly noteId: string;
  readonly chatId: number;
}

/**
 * The notebook chat's transcript, streamed over AG-UI and rendered through
 * CopilotKit: messages come from the chat's agent, tool calls from the
 * registered tool renderers, and a turn's status line from the activity
 * renderer. Opening a chat loads its history and rejoins a running turn;
 * leaving it only stops watching.
 */
export function CopilotNotebookChat({ noteId, chatId }: CopilotNotebookChatProps) {
  const agent = useMemo(() => notebookChatAgent(noteId, chatId), [noteId, chatId]);
  useEffect(() => {
    void agent.load();
    return () => agent.detach();
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
      <Transcript />
    </CopilotKitProvider>
  );
}

function Transcript() {
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
      {messages.map((message) => (
        <Fragment key={message.id}>
          {renderMessage(message, {
            streaming: running && message.id === lastId && isPreviewId(message.id),
            renderToolCall: (toolCall) =>
              renderToolCall({ toolCall, toolMessage: toolResults.get(toolCall.id) }),
            renderActivity: (activity) => renderActivityMessage(activity),
          })}
        </Fragment>
      ))}
    </div>
  );
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
