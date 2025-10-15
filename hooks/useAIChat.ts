import { useState, useCallback, useRef, useEffect } from 'react';
import { SSEClient } from '@/utils/ai/sseClient';
import { AIService } from '@/services/ai.service';
import type { AIMessage, AIChatRequest, AIConversation, AIConversationListItem } from '@/types/ai';

export interface UseAIChatReturn {
  messages: AIMessage[];
  sendMessage: (messageText: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  conversationId: number | null;
  streamingContent: string;
  loadConversation: (convId: number) => Promise<void>;
  conversations: AIConversationListItem[];
  isLoadingConversations: boolean;
  fetchConversations: () => Promise<void>;
  startNewConversation: () => void;
}

export function useAIChat(noteId: number): UseAIChatReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [conversations, setConversations] = useState<AIConversationListItem[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const sseClientRef = useRef<SSEClient | null>(null);
  const streamingContentRef = useRef<string>('');

  // Define fetchConversations first (needed by sendMessage)
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const convs = await AIService.getConversations(noteId);
      // Handle both array and object with results array
      const conversationsArray: AIConversationListItem[] = Array.isArray(convs)
        ? convs
        : (convs as any)?.results || [];
      setConversations(conversationsArray);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setConversations([]); // Set empty array on error
    } finally {
      setIsLoadingConversations(false);
    }
  }, [noteId]);

  const sendMessage = useCallback(
    async (messageText: string) => {
      // Add user message immediately
      const userMsg: AIMessage = {
        id: Date.now(),
        role: 'USER',
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setIsLoading(true);
      setError(null);
      setStreamingContent('');
      streamingContentRef.current = '';

      const client = new SSEClient();
      sseClientRef.current = client;

      const url = AIService.getChatStreamUrl(noteId);
      const body: AIChatRequest = {
        message: messageText,
        conversation_id: conversationId || undefined,
      };

      await client.stream(url, body, {
        onChunk: (chunk) => {
          if (chunk.delta) {
            streamingContentRef.current += chunk.delta;
            setStreamingContent(streamingContentRef.current);
          }
        },
        onDone: (data) => {
          const assistantMsg: AIMessage = {
            id: data.message_id,
            role: 'ASSISTANT',
            content: streamingContentRef.current,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);

          // Update conversation ID and refresh list if it's a new conversation
          const wasNewConversation = !conversationId;
          setConversationId(data.conversation_id);

          if (wasNewConversation) {
            // Refresh conversations list to show the new one
            fetchConversations();
          }

          setStreamingContent('');
          streamingContentRef.current = '';
          setIsLoading(false);
        },
        onError: (err) => {
          setError(err);
          setIsLoading(false);
          setStreamingContent('');
          streamingContentRef.current = '';
        },
      });
    },
    [noteId, conversationId, fetchConversations]
  );

  const loadConversation = useCallback(async (convId: number) => {
    try {
      const conversation = await AIService.getConversation(convId);
      setMessages(conversation.messages);
      setConversationId(convId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load conversation'));
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setStreamingContent('');
    streamingContentRef.current = '';
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    conversationId,
    streamingContent,
    loadConversation,
    conversations,
    isLoadingConversations,
    fetchConversations,
    startNewConversation,
  };
}
