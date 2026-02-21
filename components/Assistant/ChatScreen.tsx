'use client';

import React, { useCallback, useRef } from 'react';
import type { AssistantRole, QuickReply, ChatState, ChatAction } from '@/types/assistant';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { QuickReplies } from './QuickReplies';
import { ChatInput } from './ChatInput';

interface ChatScreenProps {
  role: AssistantRole;
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string, structuredInput?: { field: string; value: any }) => void;
  onSubmit: () => void;
  editorOpen: boolean;
  onToggleEditor: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  role,
  state,
  dispatch,
  sendMessage,
  onSubmit,
  editorOpen,
  onToggleEditor,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback((message: string) => sendMessage(message), [sendMessage]);

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      if (reply.value === null) {
        inputRef.current?.focus();
        dispatch({ type: 'CLEAR_QUICK_REPLIES' });
        return;
      }
      sendMessage(reply.value);
    },
    [sendMessage, dispatch]
  );

  const handleStructuredInput = useCallback(
    (field: string, value: any, displayText: string) => {
      if (field === 'submit') {
        onSubmit();
        return;
      }
      if (field === 'edit') {
        sendMessage("I'd like to make some edits before submitting.");
        return;
      }
      sendMessage(displayText, { field, value });
    },
    [sendMessage, onSubmit]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] bg-white overflow-hidden">
      <ChatHeader
        role={role}
        fieldState={state.fieldState}
        editorOpen={editorOpen}
        onToggleEditor={onToggleEditor}
      />

      <MessageList
        messages={state.messages}
        isTyping={state.isTyping}
        onStructuredInput={handleStructuredInput}
        onOpenEditor={onToggleEditor}
      />

      {state.quickReplies && state.quickReplies.length > 0 && (
        <QuickReplies replies={state.quickReplies} onSelect={handleQuickReply} />
      )}

      <ChatInput
        onSend={handleSend}
        isTyping={state.isTyping}
        hasQuickReplies={!!state.quickReplies && state.quickReplies.length > 0}
        inputRef={inputRef}
      />
    </div>
  );
};
