'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat, type UseAIChatReturn } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/Button';
import { Send, Loader2, MessageSquarePlus, Clock } from 'lucide-react';
import type { AIMessage, AIConversationListItem } from '@/types/ai';

interface AIChatPanelProps {
  noteId: number;
}

export function AIChatPanel({ noteId }: AIChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    error,
    streamingContent,
    conversationId,
    conversations,
    isLoadingConversations,
    loadConversation,
    startNewConversation,
  } = useAIChat(noteId) as UseAIChatReturn;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-load most recent conversation when conversations are fetched
  useEffect(() => {
    if (conversations.length > 0 && messages.length === 0 && !conversationId) {
      // Load the first conversation (most recent)
      loadConversation(conversations[0].id);
    }
  }, [conversations, messages.length, conversationId, loadConversation]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadConversation = async (convId: number) => {
    await loadConversation(convId);
    setShowConversations(false);
  };

  const handleNewConversation = () => {
    startNewConversation();
    setShowConversations(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          {conversationId && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Show conversations"
            title="Conversation history"
          >
            <Clock className="h-5 w-5" />
          </button>
          <button
            onClick={handleNewConversation}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="New conversation"
            title="Start new conversation"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      {showConversations && (
        <div className="border-b border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Previous Conversations</h3>
              {isLoadingConversations && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            </div>

            {conversations.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No previous conversations</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === conversationId}
                    onClick={() => handleLoadConversation(conv.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">
              Ask me to find papers, explain concepts, or help with your writing.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {isLoading && streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm font-medium">AI</span>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{streamingContent}</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm font-medium">AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-blue-100'
        }`}
      >
        <span className={`text-sm font-medium ${isUser ? 'text-white' : 'text-blue-600'}`}>
          {isUser ? 'You' : 'AI'}
        </span>
      </div>
      <div
        className={`flex-1 rounded-lg p-3 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: AIConversationListItem;
  isActive: boolean;
  onClick: () => void;
}) {
  // Use the title directly from the API, or provide a fallback
  const title = conversation.title || 'New Conversation';

  const date = new Date(conversation.created_date);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const messageCount = conversation.message_count;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-900 border border-blue-300'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="font-medium truncate">{title}</div>
      <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
        {dateStr}
        {messageCount > 0 && ` • ${messageCount} messages`}
      </div>
    </button>
  );
}
