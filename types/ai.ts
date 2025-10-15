// Request/Response types
export interface AICompletionRequest {
  context: string;
  cursor_position: number;
}

export interface AIChatRequest {
  message: string;
  conversation_id?: number;
}

export interface AIUsageResponse {
  completions_used: number;
  completions_limit: number;
  messages_used: number;
  messages_limit: number;
  reset_time: string;
}

export interface AISubscriptionResponse {
  plan: 'FREE' | 'PREMIUM';
  status: 'active' | 'cancelled' | 'expired';
  current_period_end?: string;
}

// SSE Stream types (simplified - no tool calling)
export interface SSEChunk {
  delta: string; // Text delta for streaming
}

export interface SSEDoneEvent {
  conversation_id?: number;
  message_id?: number;
  completion_log_id?: number;
  tokens_used?: number;
  quota_info?: {
    messages_used: number;
    messages_limit: number;
    completions_used: number;
    completions_limit: number;
  };
}

export interface SSEErrorEvent {
  error: string;
  quota_exceeded?: boolean;
}

// Conversation types (tool_calls/tool_results removed - simplified backend)
export interface AIMessage {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  created_at: string;
}

export interface AIConversation {
  id: number;
  note_id: number;
  created_at: string;
  updated_at: string;
  messages: AIMessage[];
}

// Conversation list item (from list endpoint)
export interface AIConversationListItem {
  id: number;
  note: number;
  title: string;
  message_count: number;
  last_message_date: string;
  created_date: string;
  updated_date: string;
}
