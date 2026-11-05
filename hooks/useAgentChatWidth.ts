'use client';

import { useResizableWidth } from './useResizableWidth';

const STORAGE_KEY = 'notebook:agent-chat-width';

export const MIN_AGENT_CHAT_WIDTH = 360;
export const MAX_AGENT_CHAT_WIDTH = 640;
export const DEFAULT_AGENT_CHAT_WIDTH = 420;

export interface AgentChatWidth {
  readonly width: number;
  /** True while a pointer drag is in flight — hosts suspend width transitions. */
  readonly isResizing: boolean;
  readonly startResize: () => void;
  /** Keyboard resize: negative grows the panel (its divider sits on the left). */
  readonly nudgeWidth: (deltaX: number) => void;
}

/**
 * Width of the right-docked assistant panel, persisted per browser — the
 * generic {@link useResizableWidth} anchored to the viewport's right edge.
 */
export function useAgentChatWidth(): AgentChatWidth {
  return useResizableWidth({
    storageKey: STORAGE_KEY,
    min: MIN_AGENT_CHAT_WIDTH,
    max: MAX_AGENT_CHAT_WIDTH,
    defaultWidth: DEFAULT_AGENT_CHAT_WIDTH,
    anchor: 'right',
  });
}
