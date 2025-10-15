import { ApiClient } from './client';
import type {
  AIUsageResponse,
  AISubscriptionResponse,
  AIConversation,
  AIConversationListItem,
} from '@/types/ai';

export class AIService {
  private static readonly BASE_PATH = '/api';

  static async getUsage(): Promise<AIUsageResponse> {
    return ApiClient.get<AIUsageResponse>(`${this.BASE_PATH}/ai/usage`);
  }

  static async acceptCompletion(completionLogId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/ai/completion/accept`, {
      completion_log_id: completionLogId,
    });
  }

  static async getSubscription(): Promise<AISubscriptionResponse> {
    return ApiClient.get<AISubscriptionResponse>(`${this.BASE_PATH}/ai/subscription`);
  }

  static async createCheckoutSession(): Promise<{ url: string }> {
    return ApiClient.post<{ url: string }>(`${this.BASE_PATH}/ai/subscription/create`, {});
  }

  static async cancelSubscription(): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}/ai/subscription/cancel`);
  }

  static async getConversations(noteId: number): Promise<AIConversationListItem[]> {
    return ApiClient.get<AIConversationListItem[]>(
      `${this.BASE_PATH}/ai/conversation?note_id=${noteId}`
    );
  }

  static async getConversation(conversationId: number): Promise<AIConversation> {
    return ApiClient.get<AIConversation>(`${this.BASE_PATH}/ai/conversation/${conversationId}`);
  }

  static async deleteConversation(conversationId: number): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}/ai/conversation/${conversationId}`);
  }

  static getCompletionStreamUrl(noteId: number): string {
    return `${process.env.NEXT_PUBLIC_API_URL}${this.BASE_PATH}/note/${noteId}/ai/complete`;
  }

  static getChatStreamUrl(noteId: number): string {
    return `${process.env.NEXT_PUBLIC_API_URL}${this.BASE_PATH}/note/${noteId}/ai/chat`;
  }
}
