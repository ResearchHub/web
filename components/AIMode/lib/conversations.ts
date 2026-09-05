import { createId } from './ids';
import type {
  ActivityStep,
  AIConversation,
  Attachment,
  ChatMessage,
  MessageBlock,
  QuickReply,
} from './types';

export { createId } from './ids';

export const createUserMessage = (
  content: string,
  attachments: Attachment[] = []
): ChatMessage => ({
  id: createId('msg'),
  role: 'user',
  blocks: [{ kind: 'text', content }],
  quickReplies: [],
  status: 'complete',
  attachments,
  revealedBlocks: 1,
  createdAt: Date.now(),
});

interface AssistantMessageOptions {
  blocks: MessageBlock[];
  quickReplies?: QuickReply[];
  thinkingLabel?: string;
  activity?: ActivityStep[];
  stageId?: string;
}

export const createAssistantMessage = ({
  blocks,
  quickReplies = [],
  thinkingLabel,
  activity,
  stageId,
}: AssistantMessageOptions): ChatMessage => ({
  id: createId('msg'),
  role: 'assistant',
  blocks,
  quickReplies,
  status: 'thinking',
  thinkingLabel,
  activity,
  stageId,
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
  grantId: null,
  panel: { open: false, tab: 'org' },
  updatedAt: Date.now(),
});
