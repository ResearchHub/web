import { DEFAULT_GUARDRAILS } from './script';
import type { AIConversation, ChatMessage, MessageBlock, QuickReply } from './types';

let idCounter = 0;

/**
 * Ids only need to be unique within a session; `crypto.randomUUID` isn't
 * available in every browser the demo may run on.
 */
export const createId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
};

export const createUserMessage = (content: string): ChatMessage => ({
  id: createId('msg'),
  role: 'user',
  blocks: [{ kind: 'text', content }],
  quickReplies: [],
  status: 'complete',
  revealedBlocks: 1,
  createdAt: Date.now(),
});

interface AssistantMessageOptions {
  blocks: MessageBlock[];
  quickReplies?: QuickReply[];
  thinkingLabel?: string;
}

export const createAssistantMessage = ({
  blocks,
  quickReplies = [],
  thinkingLabel,
}: AssistantMessageOptions): ChatMessage => ({
  id: createId('msg'),
  role: 'assistant',
  blocks,
  quickReplies,
  status: 'thinking',
  thinkingLabel,
  revealedBlocks: 0,
  createdAt: Date.now(),
});

export const createConversation = (): AIConversation => ({
  id: createId('conv'),
  title: 'New conversation',
  subtitle: 'Just started',
  track: null,
  stageId: null,
  messages: [],
  documentOpen: false,
  revealedSections: [],
  guardrails: { ...DEFAULT_GUARDRAILS },
  guardrailsConfirmed: false,
  fundedAmountUsd: null,
  updatedAt: Date.now(),
});
